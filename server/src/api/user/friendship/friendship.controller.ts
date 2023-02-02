import { ClassSerializerInterceptor, Controller, Req, UseGuards, UseInterceptors, Get, Put, Delete, Body, Inject, Post } from '@nestjs/common';
import { Friendship } from './friendship.entity';
import { User } from '../user.entity';
import { DeleteFriendDto, RequestFriendDto, ResponseFriendDto } from './friendship.dto';
import { JwtAuthGuard } from '..//auth/auth.guard';
import { FriendshipService, Others } from './friendship.service';
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

	@Put('response')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private responseFriend(@Body() body: ResponseFriendDto, @Req() req: Request): Promise<number>{
		return this.service.responseFriend(body, req);
	}

	@Get('friends')
	@UseGuards(JwtAuthGuard)
	private friends(@Req() { user }: Request): Promise< User[] | never> {
		return this.service.friends(<User>user);
	}

	@Get('asked')
	@UseGuards(JwtAuthGuard)
	private asked(@Req() { user }: Request): Promise< User[] | never> {
		return this.service.asked(<User>user);
	}

	@Get('askers')
	@UseGuards(JwtAuthGuard)
	private askers(@Req() { user }: Request): Promise< User[] | never> {
		return this.service.askers(<User>user);
	}

	@Get('others')
	@UseGuards(JwtAuthGuard)
	private others(@Req() { user }: Request): Promise< Others | never> {
		return this.service.others(<User>user);
	}

	@Delete('delete')
	@UseGuards(JwtAuthGuard)
	private deleteFriend(@Body() body: DeleteFriendDto, @Req() req: Request): Promise<number>{
		return this.service.deleteFriend(body, req);
	}
}