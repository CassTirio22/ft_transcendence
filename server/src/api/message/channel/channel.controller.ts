import { CreateChannelDto } from './channel.dto';
import { JwtAuthGuard } from './../../user/auth/auth.guard';
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Channel } from "./channel.entity";
import { ChannelService } from "./channel.service";
import { Request } from "express";

@Controller('channel')
export class ChannelController {
	constructor(private channelService: ChannelService) {}

	@Post('create')
	@UseGuards(JwtAuthGuard)
	private create(@Body() body: CreateChannelDto, @Req() req: Request): Promise<Channel> {
		return this.channelService.create(body, req);
	}
}