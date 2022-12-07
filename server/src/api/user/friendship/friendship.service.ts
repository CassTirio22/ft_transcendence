import { Injectable, HttpException, HttpStatus, Catch } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, QueryResult, QueryBuilder, InsertResult, Brackets } from 'typeorm';
import { Friendship, FriendshipStatus } from './friendship.entity';
import { User } from '../user.entity';
import { RequestFriendDto, ResponseFriendDto, DeleteFriendDto } from './friendship.dto';
import { Request } from 'express';

@Injectable()
export class FriendshipService {
	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(Friendship)
	private readonly friendshipRepository: Repository<Friendship>

	public async requestFriend(body: RequestFriendDto, req: Request): Promise<Friendship | never> {
		const user: User = <User>req.user;
		const { id }: RequestFriendDto = body;

		let friend: User = await this.userRepository.createQueryBuilder()
			.select()
			.where("id = :friendId", {friendId: id})
			.getOne();
		let friendship: Friendship = await this.friendshipRepository.createQueryBuilder()
			.select()
			.where("applicantid = :userId", {userId: user.id})
			.andWhere("solicitedid = :friendId", {friendId: id})
			.getOne();
		if (!friend) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		else if (user.id == id || friendship) {
			throw new HttpException("Conflict", HttpStatus.CONFLICT);
		}
		return (await this.friendshipRepository.createQueryBuilder()
			.insert()
			.values({applicant: user.id, solicited: friend.id})
			.execute()).generatedMaps[0] as Friendship;
	}

	public async responseFriend(body: ResponseFriendDto, req: Request): Promise<Friendship> {
		const { didAccept, applicant }: ResponseFriendDto = body;
		const user: User = <User>req.user;

		let friendship: Friendship = await this.friendshipRepository.createQueryBuilder()
			.select()
			.where("applicantid = :friendId", {friendId: applicant})
			.andWhere("solicitedid = :userId", {userId: user.id})
			.getOne();
		if (!friendship) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		else if (friendship.status != FriendshipStatus.pending) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT)
		}
		return (await this.friendshipRepository.createQueryBuilder()
			.update()
			.set( { status: didAccept ? FriendshipStatus.accepted : FriendshipStatus.rejected } )
			.where( "solicitedid = :userId", {userId: user.id} )
			.andWhere( "applicantid = :friendId", {friendId: applicant})
			.execute()).generatedMaps[0] as Friendship;
	}

	// SELECT * FROM User WHERE Id IN ( SELECT applicant FROM Friendship WHERE solicited = user.id) AND ( SELECT solicited FROM Friendship WHERE applicant = user.id)
	public async friends(user: User): Promise< User[] | never > {
		return (await this.userRepository.find ({
			where: {
				id: In(
					(await this.friendshipRepository.find({
						select: ["applicant"],
						where: {
							"solicited": user.id,
							"status": FriendshipStatus.accepted,
						}
					})).map(Friendship => Friendship.applicant)
					
					.concat(
					(await this.friendshipRepository.find({
						select: ["solicited"],
						where: {
							"applicant": user.id,
							"status": FriendshipStatus.accepted,
						}
					})).map(Friendship => Friendship.solicited))
				),
			}
		}));
	}

	public async deleteFriend(body: DeleteFriendDto, req: Request): Promise<number> {
		const { friend } : DeleteFriendDto = body;
		const user: User = <User>req.user;

		return (await this.friendshipRepository.createQueryBuilder()
			.delete()
			.where( new Brackets (query => { query
				.where("applicantid = :applicantFriendId", {applicantFriendId: friend})
				.andWhere("solicitedid = :solicitedUserId", {solicitedUserId: user.id})
			}))
			.orWhere( new Brackets (query => { query
				.where("solicitedid = :solicitedFriendId", {solicitedFriendId: friend})
				.andWhere("applicantid = :applicantUserId", {applicantUserId: user.id})
			}))
			.execute()).affected;
	}
}