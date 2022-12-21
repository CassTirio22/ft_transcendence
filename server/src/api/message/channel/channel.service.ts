import { MemberService } from './member/member.service';
import { Member, MemberLevel } from './member/member.entity';
import { User } from '@/api/user/user.entity';
import { forwardRef, Injectable, HttpStatus, HttpException, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateChannelDto, DeleteChannelDto } from './channel.dto';
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
			.leftJoinAndSelect("channel.members", "members", "members.level = :memberLevel", {memberLevel: level})
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
		await this.memberService.addOwner(channel, user);
		return channel;
	}

	public async delete(body: DeleteChannelDto, req: Request): Promise<number> {
		const { channel }: DeleteChannelDto = body;

		let owner: Member = (await this.memberService.membersLevel({channel: channel, level: "owner"}, req))[0];
		if (!owner) {
			console.log("Can't delete : user was not found as a owner of this channel.");
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		if (1) {
			return 1500;
		}
		return (await this.channelRepository.createQueryBuilder()
			.delete()
			.where("id = :channelId", {channelId: channel})
			.execute()).affected;
	}
}