import { ClassSerializerInterceptor, Controller, Req, UseGuards, UseInterceptors, Get, Put, Body, Inject, Post } from '@nestjs/common';
import { Friendship } from './friendship.entity';
import { RequestFriendDto } from './friendship.dto';
import { JwtAuthGuard } from '..//auth/auth.guard';
import { FriendshipService } from './friendship.service';
import { Request } from 'express';


@Controller('friendship')
export class FriendshipController {
	@Inject(FriendshipService)
	private readonly service: FriendshipService;

	@Post('request')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private requestFriend(@Body() body: RequestFriendDto, @Req() req: Request): Promise<Friendship | never>{
		return this.service.requestFriend(body, req);
	}
}