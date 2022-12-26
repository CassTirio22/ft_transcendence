import { JwtAuthGuard } from "@/api/user/auth/auth.guard";
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { CreateDirectDto } from "./direct.dto";
import { DirectService } from "./direct.service";
import { Request } from "express";
import { Direct } from "./direct.entity";
import { User } from "@/api/user/user.entity";

@Controller('direct')
export class DirectController {
	constructor(private directService: DirectService) {}
	
	@Post('create')
	@UseGuards(JwtAuthGuard)
	private create(@Body() body: CreateDirectDto, @Req() req: Request): Promise<Direct> {
		return this.directService.create(body, req);
	}

	@Get('directs')
	@UseGuards(JwtAuthGuard)
	private directs(@Req() req: Request): Promise<Direct[]> {
		return this.directService.directs(<User>req.user);
	}
}