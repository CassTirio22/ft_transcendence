import { StartCompetitiveGameDto, StartFriendlyGameDto, UpdateGameDto, DeleteGameDto, JoinGameDto } from './game.dto';
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
	@UseInterceptors(ClassSerializerInterceptor)
	private startCompetitiveGame(@Body() body: StartCompetitiveGameDto): Promise<Game | never> {
		return this.service.startUserGame(body, true);
	}

	@Post('startFriendly')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private startFriendlyGame(@Body() body: StartFriendlyGameDto, @Req() req: Request): Promise<Game | never> {
		return this.service.startUserGame({player1Id: (<User>req.user).id, player2Id: body.id}, false);
	}

	// @Post('startChannel')
	// @UseGuards(JwtAuthGuard)
	// @UseInterceptors(ClassSerializerInterceptor)
	// private startChannelGame(@Body() body: StartFriendlyGameDto, @Req() req: Request): Promise<Game | never> {
	// 	return this.service.startChannelGame(body, req);
	// }

	@Put('update')
	@UseInterceptors(ClassSerializerInterceptor)
	private updateGame(@Body() body: UpdateGameDto): Promise<number> {
		return this.service.updateGame(body);
	}

	@Put('join')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(ClassSerializerInterceptor)
	private joinGame(@Body() body: JoinGameDto, @Req() req: Request): Promise<number> {
		return this.service.joinGame(body, req);
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
