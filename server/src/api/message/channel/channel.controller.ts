import { CreateChannelDto, DeleteChannelDto } from './channel.dto';
import { JwtAuthGuard } from './../../user/auth/auth.guard';
import { Body, Controller, Delete, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Channel } from "./channel.entity";
import { ChannelService } from "./channel.service";
import { Request } from "express";
import { User } from '@/api/user/user.entity';

@Controller('channel')
export class ChannelController {
	constructor(private channelService: ChannelService) {}

	@Post('create')
	@UseGuards(JwtAuthGuard)
	private create(@Body() body: CreateChannelDto, @Req() req: Request): Promise<Channel> {
		return this.channelService.create(body, req);
	}

	@Get('channels')
	@UseGuards(JwtAuthGuard)
	private channels(@Req() req: Request) {
		return this.channelService.channels( (<User>req.user).id );
	}

	@Delete('delete')
	@UseGuards(JwtAuthGuard)
	private delete(@Body() body: DeleteChannelDto, @Req() req: Request): Promise<number> {
		return this.channelService.delete(body, <User>req.user);
	}
}