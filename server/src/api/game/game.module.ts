import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DirectService } from './../message/direct/direct.service';
import { UserService } from './../user/user.service';
import { AuthModule } from './../user/auth/auth.module';
import { AuthHelper } from './../user/auth/auth.helper';
import { GameGateway } from './game.gateway';
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
import { Direct } from '../message/direct/direct.entity';

@Module({
  imports: [
	JwtModule.registerAsync({
		inject:
			[ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get('JWT_KEY'),
				signOptions: { expiresIn: config.get('JWT_EXPIRES') },
	  		}),
	}),
	TypeOrmModule.forFeature([
		Game, 
		User, 
		Channel, 
		Member, 
		Message, 
		Friendship, 
		Block,
		Direct,
	]),
	AuthModule
  ],
  controllers: [GameController],
  providers: [
	GameService,
	ChannelService, 
	MemberService, 
	FriendshipService, 
	BlockService,
	GameGateway,
	UserService, 
	DirectService, 
	AuthHelper, 
  ]
})
export class GameModule {}
