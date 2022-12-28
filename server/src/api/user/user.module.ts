import { JwtStrategy } from './auth/auth.strategy';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthHelper } from './auth/auth.helper';
import { Message } from './../message/message.entity';
import { Friendship } from './friendship/friendship.entity';
import { FriendshipService } from './friendship/friendship.service';
import { Block } from './block/block.entity';
import { MemberService } from './../message/channel/member/member.service';
import { Member } from './../message/channel/member/member.entity';
import { DirectService } from './../message/direct/direct.service';
import { ChannelService } from './../message/channel/channel.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { Direct } from '../message/direct/direct.entity';
import { Channel } from '../message/channel/channel.entity';
import { UserService } from './user.service';
import { AuthModule } from './auth/auth.module';
import { BlockService } from './block/block.service';

@Module({
  imports: [
	PassportModule.register({ defaultStrategy: 'jwt', property: 'user' }),
  	JwtModule.registerAsync({
		inject:
			[ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get('JWT_KEY'),
				signOptions: { expiresIn: config.get('JWT_EXPIRES') },
	  		}),
  		}),TypeOrmModule.forFeature([User, Channel, Direct, Member, Block, Friendship, Message]), 
		AuthModule],
	controllers: [UserController],
  	providers: [UserService, ChannelService, DirectService, MemberService, BlockService, FriendshipService, AuthHelper, JwtStrategy],
})
export class UserModule {}