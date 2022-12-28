import { Block } from './../user/block/block.entity';
import { BlockService } from '@/api/user/block/block.service';
import { Friendship } from './../user/friendship/friendship.entity';
import { FriendshipService } from './../user/friendship/friendship.service';
import { Message } from './../message/message.entity';
import { Member } from './../message/channel/member/member.entity';
import { MemberService } from './../message/channel/member/member.service';
import { Channel } from './../message/channel/channel.entity';
import { ChannelService } from './../message/channel/channel.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity'
import { User } from '../user/user.entity'
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, User, Channel, Member, Message, Friendship, Block])],
  controllers: [GameController],
  providers: [GameService, ChannelService, MemberService, FriendshipService, BlockService]
})
export class GameModule {}
