import { Injectable, HttpException, HttpStatus, Catch } from '@nestjs/common';
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
		private readonly friendshipRepository: Repository<Friendship>
	){}

	public async requestFriend(body: RequestFriendDto, req: Request): Promise<Friendship | never> {
		const user: User = <User>req.user;
		const { id }: RequestFriendDto = body;

		let friend: User = await this.userRepository.createQueryBuilder('user')
			.select()
			.leftJoinAndSelect("user.sent", "sent", "sent.solicited = :solicitedId", {solicitedId: user.id})
			.leftJoinAndSelect("user.received", "received", "received.applicant = :applicantId", {applicantId: user.id})
			.where("id = :friendId", {friendId: id})
			.getOne();
		if (!friend) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		else if (user.id == id || friend.sent.length > 0 || friend.received.length > 0) {
			throw new HttpException("Conflict", HttpStatus.CONFLICT);
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

	public async deleteFriend(body: DeleteFriendDto, req: Request): Promise<number> {
		const { friend } : DeleteFriendDto = body;
		const user: User = <User>req.user;

		if (user.id == friend) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return (await this.friendshipRepository.createQueryBuilder()
			.delete()
			.where("applicant_id IN (:...friendsId_1)", {friendsId_1: [user.id, friend]})
			.andWhere("solicited_id IN (:...friendsId_2)", {friendsId_2: [user.id, friend]})
			.execute()).affected;
	}
}