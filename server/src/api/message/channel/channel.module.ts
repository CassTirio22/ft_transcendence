import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelController } from "./channel.controller";
import { Channel } from "./channel.entity";
import { ChannelService } from "./channel.service";

@Module({
	controllers: [ChannelController],
	imports: [TypeOrmModule.forFeature([Channel])],
	providers: [ChannelService]
})
export class ChannelModule {}