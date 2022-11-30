import { StartCompetitiveGameDto, StartFriendlyGameDto, UpdateGameDto, DeleteGameDto } from './game.dto';
import { JwtAuthGuard } from './../user/auth/auth.guard';
import { GameService } from './game.service';
import { Game } from './game.entity'
import { Request } from 'express';
import { ClassSerializerInterceptor, Controller, Inject, Post, Put, UseGuards, UseInterceptors, HttpStatus, Delete } from '@nestjs/common';

@Controller('game')
export class GameController {
	@Inject(GameService)
	private readonly service: GameService;

	@Post('startCompetitive')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private StartCompetitiveGame(body: StartCompetitiveGameDto, req: Request): Promise<Game | never> {
		return this.service.startCompetitiveGame(body, req);
	}

	@Post('startFriendly')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private StartFriendlyGame(body: StartFriendlyGameDto, req: Request): Promise<Game | never> {
		return this.service.startFriendlyGame(body, req);
	}

	@Put('update')
	@UseInterceptors(ClassSerializerInterceptor)
	private UpdateGame(body: UpdateGameDto): Promise<Game> {
		return this.service.updateGame(body);
	}

	@Delete('delete')
	private DeleteGame(body: DeleteGameDto): Promise<number> {
		return this.service.deleteGame(body);
	}
}
