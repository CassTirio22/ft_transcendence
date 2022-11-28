import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './friendship.entity';
import { User } from '../user.entity';

@Injectable()
export class FriendshipService {
	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(Friendship)
	private readonly friendshipRepository: Repository<Friendship>

	public async requestFriend(body: RequestFriendDto) {
		
	}
}