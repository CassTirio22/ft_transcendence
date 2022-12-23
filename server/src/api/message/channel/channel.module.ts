import { Friendship } from './../../user/friendship/friendship.entity';
import { FriendshipService } from './../../user/friendship/friendship.service';
import { MemberService } from './member/member.service';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelController } from "./channel.controller";
import { Channel } from "./channel.entity";
import { ChannelService } from "./channel.service";
import { User } from "@/api/user/user.entity";
import { Member } from './member/member.entity';

@Module({
	controllers: [ChannelController],
	imports: [TypeOrmModule.forFeature([User, Channel, Member, Friendship])],
	providers: [ChannelService, MemberService, FriendshipService]
})
export class ChannelModule {}