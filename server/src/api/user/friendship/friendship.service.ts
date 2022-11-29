import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship, FriendshipStatus } from './friendship.entity';
import { User } from '../user.entity';
import { RequestFriendDto, ResponseFriendDto } from './friendship.dto';
import { Request } from 'express';

@Injectable()
export class FriendshipService {
	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(Friendship)
	private readonly friendshipRepository: Repository<Friendship>

	public async requestFriend(body: RequestFriendDto, req: Request): Promise<Friendship | never> {
		const user: User = <User>req.user;
		const { pseudo }: RequestFriendDto = body;

		let friend: User = await this.userRepository.findOne( { where: { name: pseudo}} );
		if (!friend) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		let friendship: Friendship = await this.friendshipRepository.findOne({ where: [
			{applicant: friend.id, solicited: user.id},
			{applicant: user.id, solicited: friend.id},
		]})
		if (friendship) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}

		friendship = new Friendship();
		friendship.applicant = user.id;
		friendship.solicited = friend.id;
		// friendship.status = Status.pending; //default
		
		return this.friendshipRepository.save(friendship);
	}

	public async responseFriend(body: ResponseFriendDto, req: Request): Promise<Friendship> {
		const { didAccept, applicant }: ResponseFriendDto = body;
		const user: User = <User>req.user;

		let friendship: Friendship = await this.friendshipRepository.findOne({ where: { applicant: applicant, solicited: user.id } });
		if (!friendship) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		else if (friendship.status != FriendshipStatus.pending) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT)
		}

		if (didAccept)
			friendship.status = FriendshipStatus.accepted;
		else
			friendship.status = FriendshipStatus.rejected;
		return this.friendshipRepository.update({applicant: applicant, solicited: user.id }, {status: friendship.status})[0];
	}
}