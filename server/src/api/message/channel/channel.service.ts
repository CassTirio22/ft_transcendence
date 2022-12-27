import { MemberService } from './member/member.service';
import { Member, MemberLevel, MemberStatus } from './member/member.entity';
import { User } from '@/api/user/user.entity';
import { forwardRef, Injectable, HttpStatus, HttpException, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateChannelDto, DeleteChannelDto, EditChannelDto } from './channel.dto';
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
			.leftJoinAndSelect("channel.members", "members", "members.user_id = :userId", {userId: userId})
			.where("channel.id = :channelId", {channelId: channelId})
			.getOne());
	}

	public async channelJoinMembers(channelId: number) {
		return (await this.channelRepository.createQueryBuilder('channel')
			.innerJoinAndSelect("channel.members", "members")
			.select()
			.where("channel.id = :channelId", {channelId: channelId})
			.getOne());
	}

	public async channels(userId: number): Promise<Channel[]> {
		return ( await this.channelRepository.createQueryBuilder('channel')
			.innerJoin("channel.members", "members", "members.status != :bannedStatus", {bannedStatus: MemberStatus.banned})
			.select()
			.where("members.user_id = :memberId", {memberId: userId})
			.orWhere("channel.status IN (:...status)", {status: [ChannelStatus.public, ChannelStatus.protected]})
			.getMany());
	}

	public async edit(body: EditChannelDto, req: Request): Promise<number> {
		const user: User = <User>req.user;
		let { name, password, channel}: EditChannelDto = body;

		let ourChannel: Channel = await this.channel(channel, user.id);
		if (!ourChannel) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		else if (ourChannel.members.length < 1 || ourChannel.members[0].level != MemberLevel.owner) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}
		name = (name != null) ? name : ourChannel.name;
		password = (password != null) ? password : ourChannel.password;
		return (await this.update({name: name, password: password, channel: channel}, user));
	}

	public async update(body: EditChannelDto, user: User): Promise<number> {
		let { name, password, channel}: EditChannelDto = body;
		return (await this.channelRepository.createQueryBuilder()
			.update()
			.set({name: name,
				password: password, 
				date: () => 'NOW()'})
			.where("id = :channelId", {channelId: channel})
			.execute()).affected;
	}

	public async updateDate(channelId: number, user: User): Promise<Channel> {
		let member: Member = await this.memberService.member({channel: channelId} , user);
		if (!member) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		let channel: Channel[] = (await this.channelRepository.createQueryBuilder('channel')
			// .innerJoin("channel.members", "members", "members.user_id = :userId", {userId: userId})
			.update()
			.where("id = :channelId", {channelId: channelId})
			.set({date: () => 'NOW()'})
			.returning('*')
			.execute()).raw;
		return (channel.length == 0 ? null : channel[0]);
	}

	public async create(body: CreateChannelDto, req: Request): Promise<Channel> {
		const user: User = <User>req.user;
		const { name, password, status}: CreateChannelDto = body;

		if (status == "protected" && !password) {
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
		await this.memberService.insert({user: user.id, channel: channel.id, level: MemberLevel.owner});
		return channel;
	}

	//should I delete all linked members or cascade can do it by itself
	public async delete(body: DeleteChannelDto, user: User): Promise<number> {
		const { channel }: DeleteChannelDto = body;

		let owner: Member = (await this.memberService.members({channel: channel}, user)).find( (obj) => {return obj.level == MemberLevel.owner} );
		if (owner.user_id != user.id) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return (await this.channelRepository.createQueryBuilder('channel')
			.delete()
			.where("id = :channelId", {channelId: channel})
			.execute()).affected;
	}
}