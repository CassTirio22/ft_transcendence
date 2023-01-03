import { BlockService } from '@/api/user/block/block.service';
import { read } from 'fs';
import { Block } from './../block/block.entity';
import { Injectable, HttpException, HttpStatus, Catch, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, QueryResult, QueryBuilder, InsertResult, Brackets } from 'typeorm';
import { Friendship, FriendshipStatus } from './friendship.entity';
import { User } from '../user.entity';
import { RequestFriendDto, ResponseFriendDto, DeleteFriendDto } from './friendship.dto';
import { Request } from 'express';

@Injectable()
export class FriendshipService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Friendship)
		private readonly friendshipRepository: Repository<Friendship>,
		@Inject(BlockService)
		private blockService: BlockService
	){}

	public async requestFriend(body: RequestFriendDto, req: Request): Promise<Friendship | never> {
		const user: User = <User>req.user;
		const { id }: RequestFriendDto = body;

		await this._checkEitherBlocked(user.id, id);
		let friend: User = await this.userRepository.createQueryBuilder('user')
			.select()
			.leftJoinAndSelect("user.sent", "sent", "sent.solicited = :solicitedId", {solicitedId: user.id})
			.leftJoinAndSelect("user.received", "received", "received.applicant = :applicantId", {applicantId: user.id})
			.where("id = :friendId", {friendId: id})
			.getOne();
		if (!friend) {
			throw new HttpException('Not found. No user was found with those criterias.', HttpStatus.NOT_FOUND)
		}
		else if (user.id == id || friend.sent.length > 0 || friend.received.length > 0) {
			throw new HttpException("Conflict. You already sent a request to this user OR this user already sent you a request OR you sent it to yourself.", HttpStatus.CONFLICT);
		}
		return (await this.friendshipRepository.createQueryBuilder()
			.insert()
			.values({applicant: user, solicited: friend})
			.execute()).generatedMaps[0] as Friendship;
	}

	public async responseFriend(body: ResponseFriendDto, req: Request): Promise<number> {
		const { didAccept, applicant }: ResponseFriendDto = body;
		const user: User = <User>req.user;

		return (await this.friendshipRepository.createQueryBuilder()
			.update()
			.set( { status: didAccept ? FriendshipStatus.accepted : FriendshipStatus.rejected } )
			.where("solicited_id = :userId", {userId: user.id} )
			.andWhere("applicant_id = :friendId", {friendId: applicant})
			.andWhere("friendship.status = :pendingStatus", {pendingStatus: FriendshipStatus.pending})
			.execute()).affected;
	}

	public async friends(user: User): Promise< User[] | never > {
		return (await this.userRepository.createQueryBuilder('user')
			.leftJoin("user.received", "rec", "rec.status = :recStatus", {recStatus: FriendshipStatus.accepted})
			.leftJoin("user.sent", "sent", "sent.status = :sentStatus", {sentStatus: FriendshipStatus.accepted})
			.select()
			.where("rec.applicant = :appId", {appId: user.id})
			.orWhere("sent.solicited = :solId", {solId: user.id})
			.getMany());
	}

	public async friendsBySocket(socket: string): Promise<User[] | never> {
		return (await this.userRepository.createQueryBuilder('user')
			.leftJoin("user.received", "rec", "rec.status = :recStatus", {recStatus: FriendshipStatus.accepted})
			.leftJoin("user.sent", "sent", "sent.status = :sentStatus", {sentStatus: FriendshipStatus.accepted})
			.leftJoin("rec.applicant", "app")
			.leftJoin("sent.solicited", "sol")
			.select()
			.where("app.socket = :appSocket", {appSocket: socket})
			.orWhere("sol.socket = :solSocket", {solSocket: socket})
			.getMany());
	}

	public async friend(user: User, other: number): Promise<Friendship | never> {
		if (user.id == other) {
			throw new HttpException("Conflict. You cannot be your friend.", HttpStatus.CONFLICT);
		}
		return (await this.friendshipRepository.createQueryBuilder('friendship')
			.select()
			.where("friendship.applicant IN (:...applicantId)", {applicantId: [user.id, other]})
			.andWhere("friendship.solicited IN (:...solicitedId)", {solicitedId: [user.id, other]})
			.getOne());
	}

	public async deleteFriend(body: DeleteFriendDto, req: Request): Promise<number> {
		const { friend } : DeleteFriendDto = body;
		const user: User = <User>req.user;

		if (user.id == friend) {
			throw new HttpException('Conflict. You cannot a friendship with yourself. This path should never happen.', HttpStatus.CONFLICT);
		}
		return (await this.friendshipRepository.createQueryBuilder()
			.delete()
			.where("applicant_id IN (:...friendsId_1)", {friendsId_1: [user.id, friend]})
			.andWhere("solicited_id IN (:...friendsId_2)", {friendsId_2: [user.id, friend]})
			.execute()).affected;
	}


	/* PRIVATE UTILS -- PUT SOMEWHERE ELSE FOR CLEAN ARCHITECTURE*/

	private async _checkEitherBlocked(user1: number, user2: number): Promise<void> {
		let block: Block = await this.blockService.getEitherBlock(user1, user2);
		if (block) {
			throw new HttpException('Unauthorized. One of those users blocked the other.', HttpStatus.UNAUTHORIZED);
		}
	}
}