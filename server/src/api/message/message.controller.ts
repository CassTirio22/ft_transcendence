import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../user/auth/auth.guard";
import { SendDto, MessagesDto } from "./message.dto";
import { MessageService } from "./message.service";
import { Message } from "./message.entity";
import { Request } from 'express';

@Controller('message')
export class MessageController{
	constructor(private service: MessageService){}

	@Post('send')
	@UseGuards(JwtAuthGuard)
	send(@Body() body: SendDto, @Req() req: Request): Promise<Message> {
		return this.service.send(body, req);
	}

	@Get('conversation')
	@UseGuards(JwtAuthGuard)
	getMessages(@Body() body: MessagesDto, @Req() req: Request):  Promise<Message[]>{
		return this.service.getMessages(body, req);
	}
}