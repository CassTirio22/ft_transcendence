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

@Module({
  imports: [TypeOrmModule.forFeature([User, Channel, Direct, Member]), AuthModule],
  controllers: [UserController],
  providers: [UserService, ChannelService, DirectService, MemberService],
})
export class UserModule {}