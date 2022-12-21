import { CreateChannelDto, DeleteChannelDto } from './channel.dto';
import { JwtAuthGuard } from './../../user/auth/auth.guard';
import { Body, Controller, Delete, Post, Req, UseGuards } from "@nestjs/common";
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

	@Delete('delete')
	@UseGuards(JwtAuthGuard)
	private delete(@Body() body: DeleteChannelDto, @Req() req: Request): Promise<number> {
		return this.channelService.delete(body, req);
	}
}