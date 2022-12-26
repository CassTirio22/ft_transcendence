import { Block } from './../../../user/block/block.entity';
import { BlockService } from '@/api/user/block/block.service';
import { User } from '@/api/user/user.entity';
import { Friendship } from './../../../user/friendship/friendship.entity';
import { FriendshipService } from './../../../user/friendship/friendship.service';
import { ChannelService } from './../channel.service';
import { Member } from './member.entity';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { Channel } from '../channel.entity';

@Module({
	imports:[TypeOrmModule.forFeature([Member, Channel, Friendship, User, Block])],
	controllers: [MemberController],
	providers: [MemberService, ChannelService, FriendshipService, BlockService],
})
export class MemberModule {}