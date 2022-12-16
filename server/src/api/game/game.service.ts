import { Interface } from 'readline';
import { IsNumber } from 'class-validator';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeleteResult, Repository, InsertResult } from 'typeorm';
import {Game, GameType, GameStatus} from './game.entity';
import { DeleteGameDto, StartCompetitiveGameDto, StartFriendlyGameDto, UpdateGameDto} from './game.dto';
import { User } from '../user/user.entity';
import { Request, query } from 'express';


interface UpdateGameSettings {
	id:				number;
	interrupted:	boolean;
	winner:			User;
	loser:			User;
	winnerScore:	number;
	loserScore:		number;
}  

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		@InjectRepository(Game)
		private readonly gameRepository: Repository<Game>
	){}

	public async startCompetitiveGame(body: StartCompetitiveGameDto): Promise<Game | never> {
		const { player1Id, player2Id }: StartCompetitiveGameDto = body;

		let players: User[] = await this.userRepository.createQueryBuilder('user')
			.select()
			.leftJoinAndSelect("user.won", "won", "won.status = :wonGameState ", {wonGameState: GameStatus.ongoing})
			.leftJoinAndSelect("user.lost", "lost", "lost.status = :lostGameState ", {lostGameState: GameStatus.ongoing})
			.where("user.id IN (:...playerIds)", {playerIds: [player1Id, player2Id]})
			.getMany();
		if (players.length < 2) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		else if (players.length > 2 || players.map(p => p.won.length).concat(players.map(p => p.lost.length)).filter(n => n != 0).length > 0) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return (await this.gameRepository.createQueryBuilder()
			.insert()
			.values({winner: players[0], loser: players[1], type: GameType.competitive})
			.execute()).generatedMaps[0] as Game;
	}

	public async startFriendlyGame(body: StartFriendlyGameDto, req: Request): Promise<Game | never> {
		const user: User = <User>req.user;
		const { channelId }: StartFriendlyGameDto = body;

		//check if channel exists once it's possible => change this query to use joins later
		let game: Game = await this.gameRepository.createQueryBuilder()
			.select()
			.where("status = :gameStatus", {gameStatus: GameStatus.ongoing} )
			.andWhere(new Brackets( query => { query
				.where("winner_id = :winnerId", {winnerId: user.id})
				.orWhere("loser_id = :loserId", {loserId: user.id})
			}))
			.getOne();
		if (game) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return (await this.gameRepository.createQueryBuilder()
			.insert()
			.values({winner: user, type: GameType.friendly, channel: channelId})
			.execute()).generatedMaps[0] as Game;
	}

	public async updateGame(body: UpdateGameDto): Promise<number> {
		const { gameId, winnerId, winnerScore, loserScore, didInterrupt}: UpdateGameDto = body;

		let game: any = await this.gameRepository.createQueryBuilder('game')
			.innerJoinAndSelect("game.winner", "winner")
			.innerJoinAndSelect("game.loser", "loser")
			.where("game.id = :gameId", {gameId: gameId})
			.andWhere("game.status = :ongoingStatus", {ongoingStatus: GameStatus.ongoing})
			.andWhere(":winnerId IN (winner.id, loser.id)", {winnerId: winnerId})
			.getOne();
		if (!game) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		let settings: UpdateGameSettings = this._recalculateELO({
			id: gameId,
			interrupted: didInterrupt,
			winner: (game.winner.id == winnerId) ? game.winner : game.loser,
			loser: (game.winner.id == winnerId) ? game.loser : game.winner,
			winnerScore: winnerScore,
			loserScore: loserScore
		})
		await this._updatePlayers(settings);
		return (await this._updateGame(settings));
	}

	public async games(user: User): Promise< Game[] | never> {
		return await this.gameRepository.createQueryBuilder("game")
			.innerJoinAndSelect("game.winner", "winner")
			.innerJoinAndSelect("game.loser", "loser")
			.select()
			.where(":player IN (winner.id, loser.id)", {player: user.id})
			.andWhere("game.status = :gameStatus", {gameStatus: GameStatus.done})
			.getMany();
	}

	public async deleteGame(body: DeleteGameDto): Promise<number | null> {
		const { gameId }: DeleteGameDto = body;

		return (await this.gameRepository.createQueryBuilder()
			.delete()
			.where("id = :gameId", {gameId: gameId})
			.execute()).affected;
	}

	private async _updateGame(settings: UpdateGameSettings): Promise<number> {
		return ( await this.gameRepository.createQueryBuilder()
		.update(Game)
		.set({
			status: settings.interrupted ? GameStatus.interrupted : GameStatus.done,
			loser: settings.loser,
			winner: settings.winner,
			winnerScore: settings.winnerScore,
			loserScore: settings.loserScore})
		.where("id = :gameId", {gameId: settings.id})
		.execute()).affected;
	}

	private async _updatePlayers(players: UpdateGameSettings): Promise<number> {
		if (players.interrupted)
			return 0;
		return ( await this.userRepository.createQueryBuilder()
			.update(User)
			.set ({
				gamesNumber: () => `CASE WHEN id = ${players.loser.id} THEN ${players.loser.gamesNumber} ELSE ${players.winner.gamesNumber} END`,
				score: () => `CASE WHEN id = ${players.loser.id} THEN ${players.loser.score} ELSE ${players.winner.score} END`})
			.where("id IN (:...playerIds)", {playerIds: [players.loser.id, players.winner.id]})
			.execute()).affected;
	}

	private _recalculateELO(players: UpdateGameSettings): UpdateGameSettings {
		if (players.interrupted || players.loser.score == 0)
			return players;
		let delta: number =  (players.loser.score - players.winner.score) / 400;
		let total: number = 1 / (1 + Math.pow(10, delta));
		let k: number = (players.winner.id < 2100 && players.loser.id < 2100) ? 32 : ( (players.winner.id <= 2400 && players.loser.id <= 2400) ? 24 : 16);
		total = k * (1 - total);
		players.winner.score += Math.floor(total);
		players.loser.score -= Math.floor(total);
		++players.winner.gamesNumber;
		++players.loser.gamesNumber;
		return players;
	}
}
