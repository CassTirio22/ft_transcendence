import { BecomeMemberDto, AddMemberDto, ChangeMemberLevelDto, ChangeMemberStatusDto, QuitChannelDto } from './member.dto';
import { JwtAuthGuard } from './../../../user/auth/auth.guard';
import { Member } from './member.entity';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { MemberService } from './member.service';
import { Request } from "express";
import { read } from 'fs';
import { User } from '@/api/user/user.entity';
import { UsingJoinTableIsNotAllowedError } from 'typeorm';

@Controller('member')
export class MemberController {
	constructor(private memberService: MemberService){}

	@Post('become')
	@UseGuards(JwtAuthGuard)
	private become(@Body() body: BecomeMemberDto, @Req() req: Request): Promise<Member> {
		return this.memberService.becomeMember(body, req);
	}

	@Post('add')
	@UseGuards(JwtAuthGuard)
	private add(@Body() body: AddMemberDto, @Req() req: Request): Promise<Member> {
		return this.memberService.addMember(body, req);
	}

	@Get('members/:channel')
	@UseGuards(JwtAuthGuard)
	private members(@Param('channel') channel: number, @Req() req: Request): Promise<Member[]> {
		return this.memberService.members(channel, <User>req.user);
	}

	@Put('level')
	@UseGuards(JwtAuthGuard)
	private changeLevel(@Body() body: ChangeMemberLevelDto, @Req() req: Request): Promise<number> {
		return this.memberService.changeLevel(body, req);
	}

	@Put('status')
	@UseGuards(JwtAuthGuard)
	private changeStatus(@Body() body: ChangeMemberStatusDto, @Req() req: Request): Promise<number> {
		return this.memberService.changeStatus(body, req);
	}

	@Delete('quit/:channel')
	@UseGuards(JwtAuthGuard)
	private quit(@Param('channel') channel: number, @Req() req: Request): Promise<number> {
		const body: QuitChannelDto = {
			channel: channel,
			newOwner: 0
		}
		return this.memberService.quit(body, req);
	}
}