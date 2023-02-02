import { ClassSerializerInterceptor, Controller, Req, UseGuards, UseInterceptors, Get, Put, Body, Inject, Param, Post, UploadedFile, Res, Delete } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '@/api/user/auth/auth.guard';
import { EditUserDto, CustomizeUserDto } from './user.dto';
import { User } from './user.entity';
import { Direct } from '../message/direct/direct.entity';
import { Channel } from '../message/channel/channel.entity';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

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

	@Put('customize')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private customize(@Body() body: CustomizeUserDto, @Req() req: Request): Promise<number | never> {
		return this,this.service.customize(body, <User>req.user);
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
	private ladder(@Req() { user }: Request): Promise<User[] | never> {
		return this.service.ladder();
	}
	
	@Get('discussions')
	@UseGuards(JwtAuthGuard)
	dicussions(@Req() req: Request): Promise<(Direct | Channel)[]> {
		return this.service.discussions( <User>req.user);
	}

	@Post('uploadPicture')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('file'))
	async uploadPicture(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
		return this.service.uploadPicture(file, req);
	}

	@Get('getPicture')
	@UseGuards(JwtAuthGuard)
	async getPicture(@Req() req: Request, @Res() res: Response)  {
		const pic: string = await this.service.getPicture(<User>req.user);
		if (pic != null)
			res.sendFile(pic);
	}

	@Delete('deletePicture')
	@UseGuards(JwtAuthGuard)
	async deletePicture(@Req() req: Request): Promise<number> {
		return this.service.deletePicture(req);
	}
}