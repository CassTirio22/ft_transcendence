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

interface MemberSettings {
	user:		number;
	channel:	number;
	level?:		MemberLevel;
	status?:	MemberStatus
}

@Injectable({})
export class MemberService {
	constructor(
		@InjectRepository(Member)
		private memberRepository: Repository<Member>,
		@InjectRepository(Channel)
		private channelRepository: Repository<Channel>,
		@Inject(forwardRef( () => ChannelService))
		private channelService: ChannelService,
	) {}

	public async becomeMember(body: BecomeMemberDto, req: Request): Promise<Member> {
		const user: User = <User>req.user;
		const { channel, password }: BecomeMemberDto = body;

		let ourChannel: Channel = await this.channelService.channel(channel, user.id);
		if (!ourChannel) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		else if (ourChannel.status == ChannelStatus.private || (ourChannel.status == ChannelStatus.protected && !this._checkPassword(password, ourChannel)) ) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return (await this.memberRepository.createQueryBuilder()
			.insert()
			.values({
				user: user,
				channel_id: channel
			})
			.execute()).generatedMaps[0] as Member;
	}
	
	public async addMember(body: AddMemberDto, req: Request): Promise<Member> {
		const user: User = <User>req.user;
		const { channel, member }: AddMemberDto = body;

		let memberChannel: Channel = await this.channelRepository.createQueryBuilder()
			.innerJoinAndSelect("channel.members", "members", ":userId IN members.user_id AND :memberId NOT IN members.user_id")
			.select()
			.where("channel.status IN (:...channelStatus)", {channelStatus: [ChannelStatus.public, ChannelStatus.protected]})
			.orWhere(new Brackets( query => { query
				.where("channel.status = :privateStatus", {privateStatus: ChannelStatus.private})
				.andWhere("members.level IN (:...neededLevels)", {neededLevels: [MemberLevel.administrator, MemberLevel.owner]})
			}))
			.getOne();
		if (!memberChannel) {
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		}
		return (await this.memberRepository.createQueryBuilder()
			.insert()
			.values({
				user_id: member,
				channel_id: channel,
			})
			.execute()).generatedMaps[0] as Member;
	}

	public async addOwner(channel: Channel, owner: User): Promise<Member> {
		return (await this.memberRepository.createQueryBuilder()
			.insert()
			.values({
				user: owner,
				channel: channel,
				level: MemberLevel.owner
			})
			.execute())[0] as Member;
	}

	public async member(body: GetMembersDto, user: User): Promise<Member | never> {
		return (await this.memberRepository.createQueryBuilder('member')
		.innerJoin("member.channel", "channel", "channel.id = :channelId", {channelId: channel})
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
			console.log("Can't list members: user was not found as a member of this channel.")
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return members;
	}

	public async changeStatus(body: ChangeMemberStatusDto, req: Request): Promise<number> {
		const user: User = <User>req.user;
		const { time, member, status, channel }: ChangeMemberStatusDto = body;

		await this._checkUserPermission({user: member, channel: channel}, user);
		return (await this.memberRepository.createQueryBuilder('member')
			.update()
			.set({
				block_until: time == 'infinity' ? time : () => ('NOW()' + new Date(time)),
				status: this._stringToStatus(status)
			})
			.where("member.id = :memberId", {memberId: member})
			.execute()).affected;
	}

	public async changeLevel(body: ChangeMemberLevelDto, req: Request): Promise<number> {
		const user: User = <User>req.user;
		const { member, level, channel }: ChangeMemberLevelDto = body;

		await this._checkUserPermission({user: member, channel: channel}, user);
		return (await this.memberRepository.createQueryBuilder('member')
			.update()
			.set({ level: this._stringToLevel(level) })
			.where("member.id = :memberId", {memberId: member})
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
			return (await this.delete({ channel: channel, member: user.id})); //if needed, could be done by cascade : then return 1;
		}

		let owner: Member = await this.member({channel: channel}, user);
		if (!owner) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		if (owner.level = MemberLevel.owner) {
			let tmp: number = (await this.memberRepository.createQueryBuilder('member')
				.update()
				.set({level: MemberLevel.owner})
				.where("member.user_id = :memberId", {memberId: newOwner})
				.andWhere("member.user_id != :userId", {userId: user.id})
				.andWhere("member.channel_id = :channelId", {channelId: channel})
				.execute()).affected;
			if (!tmp) {
				throw new HttpException('Conflict', HttpStatus.CONFLICT);
			}
		}
		return (await this.delete({ channel: channel, member: user.id}));
	}

	private async _checkUserPermission(settings: MemberSettings, user: User): Promise<Channel> {	
		let ourChannel: Channel  = await (this.channelService.channelJoinMembers(settings.channel));
		let userMember: Member = ourChannel.members.find( (obj) => {obj.user_id == user.id} );
		let wantedMember: Member = ourChannel.members.find( (obj) => {obj.user_id == settings.user} );
		if (!ourChannel || !wantedMember || !userMember) {
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		}
		else if (userMember.level == MemberLevel.regular || (userMember.level == MemberLevel.administrator && wantedMember.level != MemberLevel.regular)) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return ourChannel;
	}

	private async _checkPassword(password: string, channel: Channel): boolean {
		return (password == channel.password);
	}

	private _stringToLevel(level: string): MemberLevel {
		return ((level == "owner") ? MemberLevel.owner : (level == "administrator" ? MemberLevel.administrator : MemberLevel.regular));
	}

	private _stringToStatus(status: string): MemberStatus {
		return ( (status == "banned" ? MemberStatus.banned : (status == "muted" ? MemberStatus.muted : MemberStatus.regular)) );
	}
}