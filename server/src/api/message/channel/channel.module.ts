import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelController } from "./channel.controller";
import { Channel } from "./channel.entity";
import { ChannelService } from "./channel.service";
import { User } from "@/api/user/user.entity";

@Module({
	controllers: [ChannelController],
	imports: [TypeOrmModule.forFeature([User, Channel])],
	providers: [ChannelService]
})
export class ChannelModule {}