import { Friendship } from './../user/friendship/friendship.entity';
import { FriendshipService } from './../user/friendship/friendship.service';
import { Block } from './../user/block/block.entity';
import { BlockService } from '@/api/user/block/block.service';
import { MemberService } from './channel/member/member.service';
import { ChannelService } from './channel/channel.service';
import { DirectService } from './direct/direct.service';
import { Channel } from './channel/channel.entity';
import { Direct } from './direct/direct.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { MessageController } from './message.controller';
import { Message } from './message.entity';
import { MessageService } from './message.service';
import { Member } from './channel/member/member.entity';

@Module({
	controllers: [MessageController],
	imports: [TypeOrmModule.forFeature([Message, Direct, User, Channel, Member, Block, Friendship])], 
	providers: [MessageService, DirectService, ChannelService, MemberService, BlockService, FriendshipService]
})
export class MessageModule{}