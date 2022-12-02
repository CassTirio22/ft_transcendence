import { StartCompetitiveGameDto, StartFriendlyGameDto, UpdateGameDto, DeleteGameDto } from './game.dto';
import { JwtAuthGuard } from './../user/auth/auth.guard';
import { GameService } from './game.service';
import { Game } from './game.entity'
import { User } from '../user/user.entity'
import { Request } from 'express';
import { ClassSerializerInterceptor, Controller, Inject, Post, Put, UseGuards, UseInterceptors, HttpStatus, Delete, Get, Req, Body } from '@nestjs/common';

@Controller('game')
export class GameController {
	@Inject(GameService)
	private readonly service: GameService;

	@Post('startCompetitive')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private startCompetitiveGame(@Body() body: StartCompetitiveGameDto, @Req() req: Request): Promise<Game | never> {
		return this.service.startCompetitiveGame(body, req);
	}

	@Post('startFriendly')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private startFriendlyGame(@Body() body: StartFriendlyGameDto, @Req() req: Request): Promise<Game | never> {
		return this.service.startFriendlyGame(body, req);
	}

	@Put('update')
	@UseInterceptors(ClassSerializerInterceptor)
	private updateGame(@Body() body: UpdateGameDto): Promise<Game> {
		return this.service.updateGame(body);
	}

	@Get('games')
	@UseGuards(JwtAuthGuard)
	private games(@Req() { user }: Request): Promise< Game[] | never > {
		return this.service.games(<User>user);
	}

	@Delete('delete')
	private deleteGame(@Body() body: DeleteGameDto): Promise<number> {
		return this.service.deleteGame(body);
	}
}
