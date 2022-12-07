import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { DirectModule } from './direct/direct.module';
import { MessageController } from './message.controller';
import { Message } from './message.entity';
import { MessageService } from './message.service';

@Module({
	controllers: [MessageController],
	imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Message]), DirectModule], 
	providers: [MessageService]
})
export class MessageModule{}