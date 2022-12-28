import { ClassSerializerInterceptor, Controller, Req, UseGuards, UseInterceptors, Get, Put, Body, Inject, Param } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@/api/user/auth/auth.guard';
import { EditUserDto } from './user.dto';
import { User } from './user.entity';
import { Direct } from '../message/direct/direct.entity';
import { Channel } from '../message/channel/channel.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

	@Put('edit')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private edit(@Body() body: EditUserDto, @Req() req: Request): Promise<string | never> {
		return this.service.edit(body, req);
	}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	private profile(@Req() { user }: Request): Promise<User | never> {
		return this.service.profile(<User>user);
	}

	@Get('other/:id')
	@UseGuards(JwtAuthGuard)
	private otherProfile(@Param('id') id: number, @Req() { user }: Request): Promise<User | never> {
		return this.service.otherProfile(id, <User>user);
	}

	@Get('ladder')
	@UseGuards(JwtAuthGuard)
	private ladder(@Req() { user }: Request): Promise<User[]> {
		return 
	}

	@Get('discussions')
	@UseGuards(JwtAuthGuard)
	dicussions(@Req() req: Request): Promise<(Direct | Channel)[]> {
		return this.service.discussions(req);
	}
}