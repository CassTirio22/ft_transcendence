import { Message } from './../message.entity';
import { MemberService } from './member/member.service';
import { Member, MemberLevel, MemberStatus } from './member/member.entity';
import { User } from '@/api/user/user.entity';
import { forwardRef, Injectable, HttpStatus, HttpException, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { CreateChannelDto, DeleteChannelDto, EditChannelDto } from './channel.dto';
import { Channel, ChannelStatus } from "./channel.entity";
import { Request } from 'express';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel)
		private channelRepository: Repository<Channel>,
		@Inject(forwardRef( () => MemberService))
		private memberService: MemberService,
		@InjectRepository(Message)
		private messageRepository: Repository<Message>,
	) {}

	public async channel(channelId: number, userId: number): Promise<Channel> {
		return (await this.channelRepository.createQueryBuilder('channel')
			.select()
			.addSelect('channel.password')
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
			.leftJoinAndSelect("channel.messages", "messages")
			.leftJoin("channel.messages", "next_messages", "messages.date < next_messages.date")
			.select()
			.where("next_messages.id IS NULL")
			.andWhere( new Brackets  (query => { query
				.where("members.user_id = :memberId", {memberId: userId})
				.orWhere("channel.status IN (:...status)", {status: [ChannelStatus.public, ChannelStatus.protected]})
			}))
			.getMany());
	}

	public async otherChannels(userId: number): Promise<Channel[]> {
		return ( await this.channelRepository.createQueryBuilder('channel')
			.innerJoin("channel.members", "members", "members.status != :bannedStatus", {bannedStatus: MemberStatus.banned})
			.leftJoinAndSelect("channel.messages", "messages")
			.leftJoin("channel.messages", "next_messages", "messages.date < next_messages.date")
			.select()
			.where("next_messages.id IS NULL")
			.andWhere( new Brackets  (query => { query
				.where("members.user_id != :memberId", {memberId: userId})
				.andWhere("channel.status IN (:...status)", {status: [ChannelStatus.public, ChannelStatus.protected]})
			}))
			.getMany());
	}

	public async myChannels(userId: number): Promise<Channel[]> {
		const channels: Channel[] = ( await this.channelRepository.createQueryBuilder('channel')
			.innerJoinAndSelect("channel.members", "members", "members.status != :bannedStatus", {bannedStatus: MemberStatus.banned})
			.leftJoinAndSelect("members.user", "user")
			.leftJoinAndSelect("channel.messages", "messages")
			.leftJoin("channel.messages", "next_messages", "messages.date < next_messages.date")
			.select()
			.where("next_messages.id IS NULL")
			.getMany());
		return (channels.filter( channel => {
			const members: Member[] = (channel.members);
			if (members.length == 0 || (members.find( member => { return(member.user_id == userId) }) == undefined))
				return false;
			return true;
		}));
	}

	//if we don't want to edit password: null
	//if we want to delete it : ""
	public async edit(body: EditChannelDto, req: Request): Promise<number> {
		const user: User = <User>req.user;
		let { password, status,channel}: EditChannelDto = body;

		let ourChannel: Channel = await this.channel(channel, user.id);
		if (!ourChannel) {
			throw new HttpException('Not found. Did not found a channel with those criterias.', HttpStatus.NOT_FOUND);
		}
		else if (ourChannel.members.length < 1 || ourChannel.members[0].level != MemberLevel.owner) {
			throw new HttpException('Unauthorized. You must be the owner of this channel for this action.', HttpStatus.UNAUTHORIZED);
		}
		else if (status == "protected" && !password) {
			throw new HttpException('Conflict. A password must be set to create a protected channel.', HttpStatus.CONFLICT);
		} 
		return (await this.update(body, user));
	}

	public async update(body: EditChannelDto, user: User): Promise<number> {
		let { name, password, channel, status}: EditChannelDto = body;
		let salt: string = bcrypt.genSaltSync(user.id);
		return (await this.channelRepository.createQueryBuilder()
			.update()
			.set({name: name,
				salt: salt,
				password:  (status == "protected" ?  bcrypt.hashSync(password, salt) : null), 
				date: () => 'NOW()',
				status: "public" ? ChannelStatus.public : (status == "protected" ? ChannelStatus.protected : ChannelStatus.private)
			}) 
			.where("id = :channelId", {channelId: channel})
			.execute()).affected;
	}

	public async updateDate(channelId: number, user: User): Promise<Channel> {
		let member: Member = await this.memberService.member(channelId , user);
		if (!member) {
			throw new HttpException('Not found. Did not found a member with those criterias.', HttpStatus.NOT_FOUND);
		}
		let channel: Channel[] = (await this.channelRepository.createQueryBuilder('channel')
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
			throw new HttpException('Conflict. A password must be set to create a protected channel.', HttpStatus.CONFLICT);
		}
		let salt: string = bcrypt.genSaltSync(user.id);
		let channel: Channel = (await this.channelRepository.createQueryBuilder()
			.insert()
			.values({
				name: name,
				salt: status == "protected" ? salt : null,
				password: status == "protected" ? bcrypt.hashSync(password, salt) : null,
				status: (status == "public" ? ChannelStatus.public : (status == "protected" ? ChannelStatus.protected : ChannelStatus.private) )
			})
			.execute()).generatedMaps[0] as Channel;
		await this.memberService.insert({user: user.id, channel: channel.id, level: MemberLevel.owner});
		return channel;
	}

	public async delete(body: DeleteChannelDto, user: User): Promise<number> {
		const { channel }: DeleteChannelDto = body;

		let owner: Member = (await this.memberService.members(channel, user)).find( (obj) => {return obj.level == MemberLevel.owner} );
		if (owner.user_id != user.id) {
			throw new HttpException('Conflict. You cannot delete a channel without being its owner.', HttpStatus.CONFLICT);
		}
		return (await this.channelRepository.createQueryBuilder('channel')
			.delete()
			.where("id = :channelId", {channelId: channel})
			.execute()).affected;
	}
}