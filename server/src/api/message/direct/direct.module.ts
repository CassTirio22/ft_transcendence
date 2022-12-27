import { Friendship } from './../../user/friendship/friendship.entity';
import { FriendshipService } from './../../user/friendship/friendship.service';
import { Block } from './../../user/block/block.entity';
import { Message } from './../message.entity';
import { User } from "@/api/user/user.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DirectController } from "./direct.controller";
import { Direct } from "./direct.entity";
import { DirectService } from "./direct.service";
import { BlockService } from '@/api/user/block/block.service';

@Module({
	controllers: [DirectController],
	imports: [TypeOrmModule.forFeature([User, Direct, Block, Friendship, Message])], 
	providers: [DirectService, BlockService, FriendshipService]
})
export class DirectModule {}