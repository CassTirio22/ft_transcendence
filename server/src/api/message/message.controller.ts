import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../user/auth/auth.guard";
import { SendDto } from "./message.dto";
import { MessageService } from "./message.service";
import { Message } from "./message.entity";
import { Request } from 'express';
import { User } from "../user/user.entity";

@Controller('message')
export class MessageController{
	constructor(private service: MessageService){}

	@Post('sendDirect')
	@UseGuards(JwtAuthGuard)
	sendDirect(@Body() body: SendDto, @Req() req: Request): Promise<Message> {
		return this.service.sendDirect(body, <User>req.user);
	}

	@Post('sendChannel')
	@UseGuards(JwtAuthGuard)
	sendChannel(@Body() body: SendDto, @Req() req: Request): Promise<Message> {
		return this.service.sendChannel(body, <User>req.user);
	}

	@Get('directMessages/:direct')
	@UseGuards(JwtAuthGuard)
	directMessages(@Param('direct') direct: number, @Req() req: Request):  Promise<Message[]>{
		return this.service.directMessages(direct, req);
	}

	@Get('channelMessages/:channel')
	@UseGuards(JwtAuthGuard)
	channelMessages(@Param('channel') channel: number, @Req() req: Request):  Promise<Message[]> {
		return this.service.channelMessages(channel, req);
	}
}