import { BecomeMemberDto, AddMemberDto, GetMembersDto, ChangeMemberLevelDto, ChangeMemberStatusDto, QuitChannelDto } from './member.dto';
import { JwtAuthGuard } from './../../../user/auth/auth.guard';
import { Member } from './member.entity';
import { Body, Controller, Delete, Get, Post, Put, Req, UseGuards } from "@nestjs/common";
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

	@Get('members')
	@UseGuards(JwtAuthGuard)
	private members(@Body() body: GetMembersDto, @Req() req: Request): Promise<Member[]> {
		return this.memberService.members(body, <User>req.user);
	}

	@Put('level')
	@UseGuards(JwtAuthGuard)
	private changeLevel(body: ChangeMemberLevelDto, req: Request): Promise<number> {
		return this.memberService.changeLevel(body, req);
	}

	@Put('status')
	@UseGuards(JwtAuthGuard)
	private changeStatus(body: ChangeMemberStatusDto, req: Request): Promise<number> {
		return this.memberService.changeStatus(body, req);
	}

	@Delete('quit')
	@UseGuards(JwtAuthGuard)
	private quit(body: QuitChannelDto, req: Request): Promise<number> {
		return this.memberService.quit(body, req);
	}
}