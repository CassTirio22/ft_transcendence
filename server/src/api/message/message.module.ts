import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user/auth/auth.module';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { MessageController } from './message.controller';
import { Message } from './message.entity';
import { MessageService } from './message.service';

@Module({
	controllers: [MessageController],
	imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Message])], 
	providers: [MessageService]
})
export class MessageModule{}