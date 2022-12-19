import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../user/auth/auth.guard";
import { SendDto, MessagesDto } from "./message.dto";
import { MessageService } from "./message.service";
import { Message } from "./message.entity";
import { Request } from 'express';

@Controller('message')
export class MessageController{
	constructor(private service: MessageService){}

	@Post('sendDirect')
	@UseGuards(JwtAuthGuard)
	sendDirect(@Body() body: SendDto, @Req() req: Request): Promise<Message> {
		return this.service.sendDirect(body, req);
	}

	@Post('sendChannel')
	@UseGuards(JwtAuthGuard)
	sendChannel(@Body() body: SendDto, @Req() req: Request): Promise<Message> {
		return this.service.sendChannel(body, req);
	}

	@Get('directMessages')
	@UseGuards(JwtAuthGuard)
	directMessages(@Body() body: MessagesDto, @Req() req: Request):  Promise<Message[]>{
		return this.service.directMessages(body, req);
	}

	@Get('channelMessages')
	@UseGuards(JwtAuthGuard)
	channelMessages(@Body() body: MessagesDto, @Req() req: Request):  Promise<Message[]>{
		return this.service.channelMessages(body, req);
	}
}