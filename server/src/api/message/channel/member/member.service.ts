import { Block } from './../../../user/block/block.entity';
import { BlockService } from '@/api/user/block/block.service';
import { FriendshipService } from './../../../user/friendship/friendship.service';
import { Friendship } from './../../../user/friendship/friendship.entity';
import { channel } from 'diagnostics_channel';
import { Channel, ChannelStatus } from './../channel.entity';
import { ChannelService } from './../channel.service';
import { BecomeMemberDto, AddMemberDto, GetMembersDto, ChangeMemberStatusDto, ChangeMemberLevelDto, QuitChannelDto, DeleteMemberDto } from './member.dto';
import { Member, MemberLevel, MemberStatus } from './member.entity';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Request } from 'express';
import { User } from '@/api/user/user.entity';
import { IsObject } from 'class-validator';

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
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		else if (ourChannel.members.length > 0) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		else if (ourChannel.status == ChannelStatus.private || (ourChannel.status == ChannelStatus.protected && !this._checkPassword(password, ourChannel))) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
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

	public async member(body: GetMembersDto, user: User): Promise<Member | never> {
		return (await this.memberRepository.createQueryBuilder('member')
		.innerJoin("member.channel", "channel", "channel.id = :channelId", {channelId: body.channel})
		.innerJoin("member.user", "user", "user.id = :userId", {userId: user.id})
		.select()
		.getOne());
	}

	public async members(body: GetMembersDto, user: User): Promise<Member[]> {
		const { channel }: GetMembersDto = body;

		let members: Member[] = (await this.memberRepository.createQueryBuilder('members')
			.innerJoin("members.channel", "channel", "channel.id = :channelId", {channelId: channel})
			.select()
			.getMany());
		if (!members.find( (obj) => {return obj.user_id == user.id} )) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}
		return members;
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

		await this._checkUserChangePermission({user: member, channel: channel}, user);
		return (await this.memberRepository.createQueryBuilder('member')
			.update()
			.set({ level: this._stringToLevel(level) })
			.where("member.user_id = :memberId", {memberId: member})
			.andWhere("member.channel_id = :channelId", {channelId: channel})
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

		let members: Member[] = await this.members({channel: channel}, user);
		if (members.length == 0) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		else if (members.length == 1) {
			await this.channelService.delete({channel: channel}, user);
			return (await this.delete({ channel: channel, member: user.id}));
		}
		let owner: Member = members.find( (obj) => {return obj.user_id == newOwner} );
		if (!owner || user.id == newOwner) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
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
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		}
		let userMember: Member = ourChannel.members.find( (obj) => {return obj.user_id == user.id} );
		let wantedMember: Member = ourChannel.members.find( (obj) => {return obj.user_id == settings.user} );
		if (!wantedMember || !userMember) {
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		}
		else if (userMember.level == MemberLevel.regular || 
				(userMember.level == MemberLevel.administrator && wantedMember.level != MemberLevel.regular)) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}
		return ourChannel;
	}

	private async _checkUserAddPermission(settings: MemberSettings, user: User): Promise<Channel> {	
		let ourChannel: Channel  = await (this.channelService.channelJoinMembers(settings.channel));
		if (!ourChannel) {
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		}
		let userMember: Member = ourChannel.members.find( (obj) => {return obj.user_id == user.id} );
		let wantedMember: Member = ourChannel.members.find( (obj) => {return obj.user_id == settings.user} );
		let friendship: Friendship = await this.friendshipService.friend(user, settings.user);
		let block: Block = await this.blockService.getEitherBlock(user.id, settings.user);
		if (userMember == undefined ||
			!friendship ||
			block ||
			(ourChannel.status == ChannelStatus.private && userMember.level == MemberLevel.regular) || 
			userMember.status != MemberStatus.regular) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}
		if (wantedMember) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return ourChannel;
	}

	private _checkPassword(password: string, channel: Channel): boolean {
		return (password == channel.password);
	}

	private _stringToLevel(level: string): MemberLevel {
		return ((level == "owner") ? MemberLevel.owner : (level == "administrator" ? MemberLevel.administrator : MemberLevel.regular));
	}

	private _stringToStatus(status: string): MemberStatus {
		return ( (status == "banned" ? MemberStatus.banned : (status == "muted" ? MemberStatus.muted : MemberStatus.regular)) );
	}
}