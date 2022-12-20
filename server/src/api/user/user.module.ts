import { DirectService } from './../message/direct/direct.service';
import { ChannelService } from './../message/channel/channel.service';
import { ChannelModule } from './../message/channel/channel.module';
import { DirectModule } from './../message/direct/direct.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { Direct } from '../message/direct/direct.entity';
import { Channel } from '../message/channel/channel.entity';
import { UserService } from './user.service';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Channel, Direct]), AuthModule, DirectModule, ChannelModule],
  controllers: [UserController],
  providers: [UserService, ChannelService, DirectService],
})
export class UserModule {}