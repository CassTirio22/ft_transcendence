import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../user/auth/auth.guard";
import { SendDto } from "./message.dto";
import { MessageService } from "./message.service";
import { Message } from "./message.entity";
import { Request } from 'express';

@Controller('message')
export class MessageController{
	constructor(private messageService: MessageService){}

	//creer le message 
	@Post('send')
	@UseGuards(JwtAuthGuard)
	sendmessage(@Body() body: SendDto, @Req() req: Request) {
		return this.messageService.sendmessage(body, req);
	}
	//recupérer une liste de message d'un channel ou d'un direct dans un ordre chronologique
	@Get('conversation')
	@UseGuards(JwtAuthGuard)
	getconversation() {
		return this.messageService.getconversation();
	}
}