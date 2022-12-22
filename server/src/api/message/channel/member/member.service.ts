import { channel } from 'diagnostics_channel';
import { Channel, ChannelStatus } from './../channel.entity';
import { ChannelService } from './../channel.service';
import { BecomeMemberDto, AddMemberDto, GetMembersDto, ChangeMemberDto, QuitChannelDto } from './member.dto';
import { Member, MemberLevel, MemberStatus } from './member.entity';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Request } from 'express';
import { User } from '@/api/user/user.entity';

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
		const { level, channel }: BecomeMemberDto = body;

		let ourLevel: MemberLevel = this._stringToLevel(level);
		let ourChannel: Channel = await this.channelService.channelJoinStatus(channel, ourLevel);
		if (!ourChannel) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		else if (ourLevel == MemberLevel.owner && ourChannel.members.length > 0) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return (await this.memberRepository.createQueryBuilder()
			.insert()
			.values({
				user: user,
				channel_id: channel,
				level: ourLevel
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
		if (!channel) {
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

	public async alterStatus(body: ChangeMemberDto, req: Request): Promise<number> {
		const user: User = <User>req.user;
		const { time, member, toChange }: ChangeMemberDto = body;

		await this._checkUserPermission(body, user);
		return (await this.memberRepository.createQueryBuilder('member')
			.update()
			.set({
				block_until: time == 'infinity' ? time : () => ('NOW()' + new Date(time)),
				status: this._stringToStatus(toChange)
			})
			.where("member.id = :memberId", {memberId: member})
			.execute()).affected;
	}

	public async alterLevel(body: ChangeMemberDto, req: Request): Promise<number> {
		const user: User = <User>req.user;
		const { time, member, toChange }: ChangeMemberDto = body;

		await this._checkUserPermission(body, user);
		return (await this.memberRepository.createQueryBuilder('member')
			.update()
			.set({
				block_until: time == 'infinity' ? time : () => ('NOW()' + new Date(time)),
				level: this._stringToLevel(toChange)
			})
			.where("member.id = :memberId", {memberId: member})
			.execute()).affected;
	}

	// public async quit(body: QuitChannelDto, req: Request): Promise<number> {
	// 	const user: User = <User>req.user;
	// 	const { channel }: QuitChannelDto = body;

	// }

	private async _checkUserPermission(body: ChangeMemberDto, user: User): Promise<Channel> {
		const { member, channel }: ChangeMemberDto = body;
	
		let ourChannel: Channel  = await (this.channelService.channelJoinMembers(channel));
		let userMember: Member = ourChannel.members.find( (obj) => {obj.user_id == user.id} );
		let wantedMember: Member = ourChannel.members.find( (obj) => {obj.user_id == member} );
		if (!ourChannel || !wantedMember || !userMember) {
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		}
		else if (userMember.level == MemberLevel.regular || (userMember.level == MemberLevel.administrator && wantedMember.level != MemberLevel.regular)) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return ourChannel;
	}

	private _stringToLevel(level: string): MemberLevel {
		return ((level == "owner") ? MemberLevel.owner : (level == "administrator" ? MemberLevel.administrator : MemberLevel.regular));
	}

	private _stringToStatus(status: string): MemberStatus {
		return ( (status == "banned" ? MemberStatus.banned : (status == "muted" ? MemberStatus.muted : MemberStatus.regular)) );
	}
}