import { ChannelService } from './../channel.service';
import { BecomeMemberDto, AddMemberDto, GetMembersLevelDto, GetMembersDto } from './member.dto';
import { Member, MemberLevel } from './member.entity';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Request } from 'express';
import { User } from '@/api/user/user.entity';
import { Channel } from '../channel.entity';

@Injectable({})
export class MemberService {
	constructor(
		@InjectRepository(Member)
		private memberRepository: Repository<Member>,
		@Inject(forwardRef( () => ChannelService))
		private channelService: ChannelService,
	) {}

	public async becomeMember(body: BecomeMemberDto, req: Request): Promise<Member> {
		const user: User = <User>req.user;
		const { level, channel }: BecomeMemberDto = body;

		let ourLevel: MemberLevel = this.stringToLevel(level);
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
	
	// public async addMember(body: AddMemberDto, req: Request): Promise<Member> {
	// 	const user: User = <User>req.user;
	// 	const { level, channel, member }: AddMemberDto = body;
	
	// 	//check if user is owner or admin
	// 	//check if member already in it
	// 	//check if level is something plausible
	
	// }

	public async addOwner(channel: Channel, owner: User) {
		return (await this.memberRepository.createQueryBuilder()
			.insert()
			.values({
				user: owner,
				channel: channel,
				level: MemberLevel.owner
			}));
	}

	public async members(body: GetMembersDto, req: Request): Promise<Member[]> {
		const user: User = <User>req.user;
		const { channel }: GetMembersDto = body;

		return (await this.memberRepository.createQueryBuilder('members')
			.innerJoin("members.channel", "channel", "channel.id = :channelId AND :UserId IN channel.members", {channelId: channel})
			.select()
			.getMany());
	}

	public async membersLevel(body: GetMembersLevelDto, req: Request): Promise<Member[]> {
		const user: User = <User>req.user;
		const { channel, level }: GetMembersLevelDto = body;

		return (await this.memberRepository.createQueryBuilder('members')
			.innerJoin("members.channel", "channel", "channel.id = :channelId AND :UserId IN channel.members", {channelId: channel})
			.select()
			.where("members.level = :memberLevel", {memberLevel: this.stringToLevel(level)})
			.getMany());
	}

	private stringToLevel(level: string): MemberLevel {
		return ((level == "owner") ? MemberLevel.owner : (level == "administrator" ? MemberLevel.administrator : MemberLevel.regular));
	}
}