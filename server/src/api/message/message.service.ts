import { FriendshipService } from './../user/friendship/friendship.service';
import { Friendship } from './../user/friendship/friendship.entity';
import { MemberService } from './channel/member/member.service';
import { Member, MemberLevel, MemberStatus } from './channel/member/member.entity';
import { DirectService } from './direct/direct.service';
import { ChannelService } from './channel/channel.service';
import { Channel } from './channel/channel.entity'
import { Direct } from './direct/direct.entity';
import { Inject, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { SendDto, MessagesDto } from "./message.dto";
import { Message } from "./message.entity";
import { BlockService } from '../user/block/block.service';
import { Block } from '../user/block/block.entity';

interface MessageSettings {
	author:		User;
	origin:		Channel | Direct;
	content:	string;
}

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,
		@Inject(ChannelService)
		private channelService: ChannelService,
		@Inject(DirectService)
		private directService: DirectService,
		@Inject(MemberService)
		private memberService: MemberService,
		@Inject(BlockService)
		private blockService: BlockService,
		@Inject(FriendshipService)
		private friendshipService: FriendshipService,
	){}
	
	public async sendDirect(body: SendDto, req: Request): Promise <Message> {
		const user: User = <User>req.user;
		const { content, origin }: SendDto = body;
		
		let settings: MessageSettings = {
			author: user,
			content: content,
			origin: (await this.directService.updateDate(origin, user.id))
		};
		if (!settings.origin) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		let other: number = (user.id == (<Direct>settings.origin).user1_id) ? (<Direct>settings.origin).user2_id : (<Direct>settings.origin).user1_id;
		let friendship: Friendship = await this.friendshipService.friend(user, other);
		if (!friendship) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		await this._checkEitherBlocked(user.id, other);
		return this._insert(settings);
	}

	public async sendChannel(body: SendDto, req: Request): Promise <Message> {
		const user: User = <User>req.user;
		const { content, origin }: SendDto = body;

		let settings: MessageSettings = {
			author: user,
			content: content,
			origin: (await this.channelService.updateDate(origin, user))
		};
		if (!settings.origin) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		await this._checkMemberStatus(origin, user, [MemberStatus.regular]);
		return this._insert(settings);
	}

	public async directMessages(body: MessagesDto, req: Request): Promise<Message[]> {
		const user: User = <User>req.user;
		const { origin }: MessagesDto = body;

		let blocked: User[] = await this.blockService.getBlockedList(user);
		let query: any = this.messageRepository.createQueryBuilder('message')
			.innerJoin("message.direct", "direct", "direct.id = :directId AND :userId IN (direct.user1_id, direct.user2_id)", {directId: origin, userId: user.id})
			.select();
		if (blocked.length > 0) {
			query = query.where("message.author NOT IN (:...blockedList)", {blockedList: blocked.map( (obj) => (obj.id) )});
		}
		return await query.getMany();
	}

	public async channelMessages(body: MessagesDto, req: Request): Promise<Message[]> {
		const user: User = <User>req.user;
		const { origin }: MessagesDto = body;

		let blocked: User[] = await this.blockService.getBlockedList(user);
		let query: any = this.messageRepository.createQueryBuilder('message')
			.innerJoin("message.channel", "channel", "channel.id = :channelId", {channelId: origin})
			.select();
		if (blocked.length > 0) {
			query = query.where("message.author NOT IN (:...blockedList)", {blockedList: blocked.map( (obj) => (obj.id) )});
		}
		await this._checkMemberStatus(origin, user, [MemberStatus.regular, MemberStatus.muted]);
		return await query.getMany();
	}

	private async _insert(settings: MessageSettings): Promise<Message> {
		return (await this.messageRepository.createQueryBuilder()
			.insert()
			.values({
				content: settings.content,
				author: settings.author,
				direct: ('user1_id' in settings.origin) ? settings.origin : null,
				channel: ('name' in settings.origin) ?  settings.origin : null
			})
			.execute()).generatedMaps[0] as Message;
	}


	/* PRIVATE UTILS -- PUT SOMEWHERE ELSE FOR CLEAN ARCHITECTURE*/

	private async _checkMemberStatus(channel: number, user: User, authorized: MemberStatus[]): Promise<void> {
		let member: Member =  await this.memberService.member({channel: channel}, user);
		if (!member || authorized.find((obj) => {return member.status == obj}) == undefined) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
		}
	}

	private async _checkEitherBlocked(user1: number, user2: number): Promise<void> {
		let block: Block = await this.blockService.getEitherBlock(user1, user2);
		if (block) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}
	}
}