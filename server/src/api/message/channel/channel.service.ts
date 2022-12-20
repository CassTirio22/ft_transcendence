import { MemberService } from './member/member.service';
import { Member, MemberLevel } from './member/member.entity';
import { User } from '@/api/user/user.entity';
import { forwardRef, Injectable, HttpStatus, HttpException, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateChannelDto } from './channel.dto';
import { Channel, ChannelStatus } from "./channel.entity";
import { Request } from 'express';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel)
		private channelRepository: Repository<Channel>,
		@Inject(forwardRef( () => MemberService))
		private memberService: MemberService,
	) {}

	public async channel(channelId: number, userId: number): Promise<Channel> {
		return (await this.channelRepository.createQueryBuilder('channel')
			.select()
			.innerJoin("channel.members", "members", "members.user_id = :userId", {userId: userId})
			.where("channel.id = :channelId", {channelId: channelId})
			.getOne());
	}

	public async channelJoinStatus(channelId: number, level: MemberLevel): Promise<Channel> {
		return (await this.channelRepository.createQueryBuilder('channel')
			.select()
			.innerJoinAndSelect("channel.members", "members", "members.level = :memberLevel", {memberLevel: level})
			.where("channel.id = :channelId", {channelId: channelId})
			.getOne());
	}

	public async channels(userId: number): Promise<Channel[]> {
		return ( await this.channelRepository.createQueryBuilder('channel')
			.select()
			.innerJoin("channel.members", "members", "members.user_id = :memberId", {memberId: userId})
			.getMany());
	}

	public async updateDate(channelId: number, userId: number): Promise<Channel> {
		return (await this.channelRepository.createQueryBuilder('channel')
			.innerJoin("channel.members", "members", "members.user_id = :userId", {userId: userId})
			.update()
			.where("id = :channelId", {channelId: channelId})
			.set({date: () => 'NOW()'})
			.returning('*')
			.execute()).raw as Channel;
	}

	public async create(body: CreateChannelDto, req: Request): Promise<Channel> {
		const user: User = <User>req.user;
		const { name, password, status}: CreateChannelDto = body;

		if (status == "protected" && (!password || password.length < 3)) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		let channel: Channel = (await this.channelRepository.createQueryBuilder()
			.insert()
			.values({
				name: name,
				password: status == "protected" ? password : null,
				status: (status == "public" ? ChannelStatus.public : (status == "protected" ? ChannelStatus.protected : ChannelStatus.private) )
			})
			.execute()).generatedMaps[0] as Channel;
		this.memberService.becomeMember({level: "owner", channel: channel.id}, req);
		return channel;
	}
}