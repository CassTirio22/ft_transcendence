import { ChannelService } from './channel/channel.service';
import { DirectService } from './direct/direct.service';
import { Channel } from './channel/channel.entity';
import { Direct } from './direct/direct.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { ChannelModule } from './channel/channel.module';
import { DirectModule } from './direct/direct.module';
import { MessageController } from './message.controller';
import { Message } from './message.entity';
import { MessageService } from './message.service';

@Module({
	controllers: [MessageController],
	imports: [TypeOrmModule.forFeature([User, Message, Direct, Channel]), DirectModule , ChannelModule], 
	providers: [MessageService, DirectService, ChannelService]
})
export class MessageModule{}