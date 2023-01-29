import { JoinGameDto, CreateGameDto } from './game.dto';
import { JwtAuthGuard } from './../user/auth/auth.guard';
import { GameService, AllGames } from './game.service';
import { Game } from './game.entity'
import { User } from '../user/user.entity'
import { Request } from 'express';
import { ClassSerializerInterceptor, Controller, Inject, Post, Put, UseGuards, UseInterceptors, Get, Req, Body } from '@nestjs/common';

@Controller('game')
export class GameController {
	@Inject(GameService)
	private readonly service: GameService;

	@Post('matchmaking')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private matchmaking(@Req() req: Request) {
		return this.service.matchmaking( <User>req.user);
	}


	@Post('create')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private create(@Body() body: CreateGameDto, @Req() req: Request): Promise<Game | never> {
		return this.service.create(body, <User>req.user);
	}

	@Put('join')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private joinGame(@Body() body: JoinGameDto, @Req() req: Request): Promise<number> {
		return this.service.joinGame(body, <User>req.user);
	}

	@Get('games')
	@UseGuards(JwtAuthGuard)
	private games(@Req() { user }: Request): Promise< Game[] | never > {
		return this.service.games(<User>user);
	}
	
	@Get('all')
	@UseGuards(JwtAuthGuard)
	private allGames(@Req() { user }: Request): Promise< AllGames | never > {
		return this.service.allGames(<User>user);
	}
}
