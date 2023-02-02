import { Block } from './../block/block.entity';
import { BlockService } from '@/api/user/block/block.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipController } from './friendship.controller'
import { Friendship } from './friendship.entity';
import { FriendshipService } from './friendship.service';
import { User } from '../user.entity'

@Module({
	imports: [TypeOrmModule.forFeature([Friendship, User, Block])],
	controllers: [FriendshipController],
	providers: [FriendshipService, BlockService],
})
export class FriendshipModule {}