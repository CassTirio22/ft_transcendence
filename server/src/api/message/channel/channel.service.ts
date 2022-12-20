import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { networkInterfaces } from "os";
import { Repository } from "typeorm";
import { Channel } from "./channel.entity";

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>
	) {}

	public async channel(channelId: number, userId: number): Promise<Channel> {
		return (await this.channelRepository.createQueryBuilder('channel')
			.select()
			.innerJoin("channel.members", "members", "members.user_id = :userId", {userId: userId})
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
}