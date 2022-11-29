import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipController } from './friendship.controller'
import { Friendship } from './friendship.entity';
import { FriendshipService } from './friendship.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [TypeOrmModule.forFeature([Friendship]), AuthModule],
	controllers: [FriendshipController],
	providers: [FriendshipService],
})
export class FriendshipModule {}