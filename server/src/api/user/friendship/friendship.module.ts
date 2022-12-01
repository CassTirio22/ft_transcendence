import { UserModule } from './../user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipController } from './friendship.controller'
import { Friendship } from './friendship.entity';
import { FriendshipService } from './friendship.service';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user.entity'

@Module({
	imports: [TypeOrmModule.forFeature([Friendship, User]), AuthModule, UserModule],
	controllers: [FriendshipController],
	providers: [FriendshipService],
})
export class FriendshipModule {}