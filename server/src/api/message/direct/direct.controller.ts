import { JwtAuthGuard } from "@/api/user/auth/auth.guard";
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { DirectDto } from "./direct.dto";
import { DirectService } from "./direct.service";
import { Request } from "express";
import { Direct } from "./direct.entity";
import { User } from "@/api/user/user.entity";

@Controller('direct')
export class DirectController {
	constructor(private directService: DirectService) {}
	
	@Post('create')
	@UseGuards(JwtAuthGuard)
	private create(@Body() body: DirectDto, @Req() req: Request): Promise<Direct> {
		return this.directService.create(body, req);
	}

	@Get('getalldirect')
	@UseGuards(JwtAuthGuard)
	private getAllDirect(@Req() { user }: Request): Promise<Direct[]> {
		return this.directService.getAllDirect(<User>user);
	}
}