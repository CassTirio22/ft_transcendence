import * as bcrypt from 'bcryptjs';
import { Block } from './../../../user/block/block.entity';
import { BlockService } from '@/api/user/block/block.service';
import { FriendshipService } from './../../../user/friendship/friendship.service';
import { Friendship } from './../../../user/friendship/friendship.entity';
import { Channel, ChannelStatus } from './../channel.entity';
import { ChannelService } from './../channel.service';
import { BecomeMemberDto, AddMemberDto, ChangeMemberStatusDto, ChangeMemberLevelDto, QuitChannelDto, DeleteMemberDto } from './member.dto';
import { Member, MemberLevel, MemberStatus } from './member.entity';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Request } from 'express';
import { User } from '@/api/user/user.entity';

interface MemberSettings {
	user:		number;
	channel:	number;
	level?:		MemberLevel;
	status?:	MemberStatus
}

@Injectable()
export class MemberService {
	constructor(
		@InjectRepository(Member)
		private memberRepository: Repository<Member>,
		@InjectRepository(Channel)
		private channelRepository: Repository<Channel>,
		@Inject(forwardRef( () => ChannelService))
		private channelService: ChannelService,
		@Inject(FriendshipService)
		private friendshipService: FriendshipService,
		@Inject(BlockService)
		private blockService: BlockService
	) {}

	public async becomeMember(body: BecomeMemberDto, req: Request): Promise<Member> {
		const user: User = <User>req.user;
		const { channel, password }: BecomeMemberDto = body;

		let ourChannel: Channel = await this.channelService.channel(channel, user.id);
		if (!ourChannel) {
			throw new HttpException('Not found. Did not found a channel with those criterias.', HttpStatus.NOT_FOUND);
		}
		else if (ourChannel.members.length > 0) {
			throw new HttpException('Conflict. You seem to be already a member of this channel.', HttpStatus.CONFLICT);
		}
		else if (ourChannel.status == ChannelStatus.private ||
				(ourChannel.status == ChannelStatus.protected && !this._checkPassword(password, ourChannel))) {
			throw new HttpException('Unauthorized. This channel is private OR you have put a wrong password on a protected channel.', HttpStatus.UNAUTHORIZED);
		}
		return (await this.insert({user: user.id, channel: channel, level: MemberLevel.regular}));
	}
	
	public async addMember(body: AddMemberDto, req: Request): Promise<Member> {
		const user: User = <User>req.user;
		const { channel, member }: AddMemberDto = body;

		await this._checkUserAddPermission({user: member, channel: channel}, user);
		return (await this.insert({user: member, channel: channel, level: MemberLevel.regular}));
	}

	public async insert(settings: MemberSettings): Promise<Member> {
		return (await this.memberRepository.createQueryBuilder()
			.insert()
			.values({
				user_id: settings.user,
				channel_id: settings.channel,
				level: settings.level
			})
			.execute())[0] as Member;
	}

	public async member(channel: number, user: User): Promise<Member | never> {
		return (await this.memberRepository.createQueryBuilder('member')
		.innerJoin("member.channel", "channel", "channel.id = :channelId", {channelId: channel})
		.innerJoin("member.user", "user", "user.id = :userId", {userId: user.id})
		.select()
		.getOne());
	}

	public async memberBySocket(socket: string, channel: number): Promise<Member | never> {
		return (await this.memberRepository.createQueryBuilder('member')
			.innerJoinAndSelect("user", "user", "user.socket = :socketId", {socketId: socket})
			.select()
			.where("member.channel_id = :channelId", {channelId: channel})
			.getOne());
	}

	public async members(channel: number, user: User): Promise<Member[]> {
		let members: Member[] = (await this.memberRepository.createQueryBuilder('members')
			.innerJoinAndSelect("members.user", "user")
			.innerJoin("members.channel", "channel", "channel.id = :channelId", {channelId: channel})
			.select()
			.getMany());
		if (!members.find( (obj) => {return obj.user_id == user.id} )) {
			throw new HttpException('Unauthorized. You are no member of this channel.', HttpStatus.UNAUTHORIZED);
		}
		return members;
	}

	public async membersFromSockets(sockets: string[]): Promise<{socket: string, member: Member}[] | never> {
		let ret: {socket: string, member: Member}[] = [];
		const members: Member[] = (await this.memberRepository.createQueryBuilder('members')
			.innerJoinAndSelect("members.user", "user")
			.select()
			.where( "user.socket = ANY(:socketIds)", {socketIds: sockets})
			.getMany());
		members.forEach( (member) => { ret.push( {socket: member.user.socket, member: member} ) } );
		return ret;
	}

	public async changeStatus(body: ChangeMemberStatusDto, req: Request): Promise<number> {
		const user: User = <User>req.user;
		const { time, member, status, channel }: ChangeMemberStatusDto = body;

		await this._checkUserChangePermission({user: member, channel: channel}, user);
		return (await this.memberRepository.createQueryBuilder('member')
			.update()
			.set({
				block_until: /*time == 'infinity' ? time : () => ('NOW()' + */ new Date(time),
				status: this._stringToStatus(status)
			})
			.where("member.user_id = :memberId", {memberId: member})
			.andWhere("member.channel_id = :channelId", {channelId: channel})
			.execute()).affected;
	}

	public async changeLevel(body: ChangeMemberLevelDto, req: Request): Promise<number> {
		const user: User = <User>req.user;
		const { member, level, channel }: ChangeMemberLevelDto = body;

		await this._checkUserChangePermission({user: member, channel: channel, level: this._stringToLevel(level)}, user);
		return (await this.memberRepository.createQueryBuilder('member')
			.update()
			.set({ level: this._stringToLevel(level) })
			.where("member.user_id = :memberId", {memberId: member})
			.andWhere("member.channel_id = :channelId", {channelId: channel})
			.execute()).affected;
	}

	public async updateStatus(): Promise<number> {
		return (await this.memberRepository.createQueryBuilder('member')
			.update()
			.where("member.block_until < :time", {time: new Date()})
			.set({ status: MemberStatus.regular})
			.execute()).affected;
	}

	public async delete(body: DeleteMemberDto): Promise<number> {
		const { channel, member }: DeleteMemberDto = body;
	
		return (await this.memberRepository.createQueryBuilder('member')
			.delete()
			.where("member.user_id = :userId", {userId: member})
			.andWhere("member.channel_id = :channelId", {channelId: channel})
			.execute()).affected
	}

	public async quit(body: QuitChannelDto, req: Request): Promise<number> {
		const user: User = <User>req.user;
		const { channel, newOwner }: QuitChannelDto = body;

		let members: Member[] = await this.members(channel, user);
		if (members.length == 0) {
			throw new HttpException('Not found. This case should not happen.', HttpStatus.NOT_FOUND);
		}
		else if (members.length == 1) {
			await this.channelService.delete({channel: channel}, user);
			return (await this.delete({ channel: channel, member: user.id}));
		}
		let owner: Member = members.find( (obj) => {return obj.user_id == newOwner} );
		if (!owner || user.id == newOwner) {
			throw new HttpException('Unauthorized. You are no owner of this channel OR you have put yourself as next owner.', HttpStatus.UNAUTHORIZED);
		}
		let member: Member = members.find( (obj) => {return obj.user_id == user.id} );
		if (member.level == MemberLevel.owner) {
			let tmp: number = (await this.memberRepository.createQueryBuilder('member')
				.update()
				.set({level: MemberLevel.owner})
				.where("member.user_id = :memberId", {memberId: newOwner})
				.andWhere("member.user_id != :userId", {userId: user.id})
				.andWhere("member.channel_id = :channelId", {channelId: channel})
				.execute()).affected;
		}
		return (await this.delete({ channel: channel, member: user.id}));
	}


	/* PRIVATE UTILS -- PUT SOMEWHERE ELSE FOR CLEAN ARCHITECTURE*/

	private async _checkUserChangePermission(settings: MemberSettings, user: User): Promise<Channel> {	
		let ourChannel: Channel  = (await this.channelService.channelJoinMembers(settings.channel));
		if (!ourChannel) {
			throw new HttpException('Not Found. No channel was found with those criterias.', HttpStatus.NOT_FOUND);
		}
		let userMember: Member = ourChannel.members.find( (obj) => {return obj.user_id == user.id} );
		let wantedMember: Member = ourChannel.members.find( (obj) => {return obj.user_id == settings.user} );
		if (!wantedMember || !userMember) {
			throw new HttpException('Not Found. You and/or the other user are no members of this channel.', HttpStatus.NOT_FOUND);
		}
		else if (
			userMember.level == MemberLevel.regular || 
			(userMember.level == MemberLevel.administrator && wantedMember.level == MemberLevel.owner) ||
			(settings.level != null && settings.level == MemberLevel.owner && userMember.level != MemberLevel.owner)
		) {
			throw new HttpException('Unauthorized. The other user have at least the same member level as you.', HttpStatus.UNAUTHORIZED);
		}
		else if (settings.level != null && settings.level == MemberLevel.owner && userMember.level == MemberLevel.owner) {
			await this.memberRepository.createQueryBuilder()
				.update()
				.where("user_id = :userId", {userId: userMember.user_id})
				.andWhere("channel_id = :channelId", {channelId: userMember.channel_id})
				.set({level: MemberLevel.administrator})
				.execute();
		}
		return ourChannel;
	}

	private async _checkUserAddPermission(settings: MemberSettings, user: User): Promise<Channel> {	
		let ourChannel: Channel  = await (this.channelService.channelJoinMembers(settings.channel));
		if (!ourChannel) {
			throw new HttpException('Not Found. No channel found with those criterias.', HttpStatus.NOT_FOUND);
		}
		let userMember: Member = ourChannel.members.find( (obj) => {return obj.user_id == user.id} );
		let wantedMember: Member = ourChannel.members.find( (obj) => {return obj.user_id == settings.user} );
		let friendship: Friendship = await this.friendshipService.friend(user, settings.user);
		let block: Block = await this.blockService.getEitherBlock(user.id, settings.user);
		if (
			userMember == undefined ||
			!friendship ||
			block ||
			(ourChannel.status == ChannelStatus.private && userMember.level == MemberLevel.regular) || 
			userMember.status != MemberStatus.regular
		) {
			throw new HttpException('Unauthorized. You are not member if this channel OR you are not friend with this user\
				 OR this user blocked you OR you blocked this user OR you are muted/banned in this channel OR your member level is not high enough (private channel)'
			 , HttpStatus.UNAUTHORIZED);
		}
		if (wantedMember) {
			throw new HttpException('Conflict. This user seems to already be in this channel.', HttpStatus.CONFLICT);
		}
		return ourChannel;
	}

	private _checkPassword(password: string, channel: Channel): boolean {
		return bcrypt.compareSync(password, channel.password);
	}

	private _stringToLevel(level: string): MemberLevel {
		return ((level == "owner") ? MemberLevel.owner : (level == "administrator" ? MemberLevel.administrator : MemberLevel.regular));
	}

	private _stringToStatus(status: string): MemberStatus {
		return ( (status == "banned" ? MemberStatus.banned : (status == "muted" ? MemberStatus.muted : MemberStatus.regular)) );
	}
}