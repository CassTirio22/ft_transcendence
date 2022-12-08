import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeleteResult, Repository, InsertResult } from 'typeorm';
import {Game, GameType, GameStatus} from './game.entity';
import { DeleteGameDto, StartCompetitiveGameDto, StartFriendlyGameDto, UpdateGameDto} from './game.dto';
import { User } from '../user/user.entity';
import { Request, query } from 'express';

@Injectable()
export class GameService {

	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(Game)
	private readonly gameRepository: Repository<Game>;

	public async startCompetitiveGame(body: StartCompetitiveGameDto, req: Request): Promise<Game | never> {
		const user: User = <User>req.user;
		const { opponentId }: StartCompetitiveGameDto = body;

		let opponent: User = await this.userRepository.createQueryBuilder()
			.select()
			.where("id = :opponentId", {opponentId: opponentId})
			.getOne();
		let game: Game = await this.gameRepository.createQueryBuilder()
			.select()
				.where("status = :gameStatus", {gameStatus: GameStatus.ongoing} )
				.andWhere(new Brackets( query => { query
					.where("winner IN (:...winnerIds)", {winnerIds: [opponentId, user.id]})
					.orWhere("loser IN (:...loserIds)", {loserIds: [opponentId, user.id]})
				}))
				.getOne();
		if (!opponent) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		else if (game) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return (await this.gameRepository.createQueryBuilder()
			.insert()
			.values({winner: user.id, loser: opponentId, type: GameType.competitive})
			.execute()).generatedMaps[0] as Game;
	}

	public async startFriendlyGame(body: StartFriendlyGameDto, req: Request): Promise<Game | never> {
		const user: User = <User>req.user;
		const { channelId }: StartFriendlyGameDto = body;

		//check if channel exists once it's possible
		let game: Game = await this.gameRepository.createQueryBuilder()
			.select()
			.where("status = :gameStatus", {gameStatus: GameStatus.ongoing} )
			.andWhere(new Brackets( query => { query
				.where("winner = :winnerId", {winnerId: user.id})
				.orWhere("loser = :loserId", {loserId: user.id})
			}))
			.getOne();
		if (game) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return (await this.gameRepository.createQueryBuilder()
			.insert()
			.values({winner: user.id, type: GameType.friendly, channel: channelId})
			.execute()).generatedMaps[0] as Game;
	}

	public async updateGame(body: UpdateGameDto): Promise<Game> {
		const { gameId, winnerId, winnerScore, loserScore, didInterrupt}: UpdateGameDto = body;

		//this query could be nested/game could be joined in the select user query as its only purpose is to check if exist, get winner loser
		let game: Game = await this.gameRepository.createQueryBuilder()
			.select()
			.where("id = :gameId", {gameId: gameId})
			.getOne();
		if (!game) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		let users: User[] = await this.userRepository.createQueryBuilder()
			.select()
			.where("id IN (:...gamerIds)", {gamerIds: [game.winner, game.loser] })
			.getMany();
		if (!users || users.length < 2) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		else if (game.status != GameStatus.ongoing || ( winnerId != game.winner && winnerId != game.loser) ) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		if (!didInterrupt) {
			users = this.recalculateELO(users[0].id == winnerId ? users[0] : users[1],
										users[0].id == winnerId ? users[1] : users[0]);
			this.userRepository.save(users);
		}
		return (await this.gameRepository.createQueryBuilder()
			.update()
			.set({
				status: didInterrupt ? GameStatus.interrupted : GameStatus.done,
				loser: (game.winner == winnerId) ? game.loser : game.winner,
				winner: winnerId,
				winnerScore: winnerScore,
				loserScore: loserScore})
			.execute()).generatedMaps[0] as Game;
	}

	public async games(user: User): Promise< Game[] | never> {
		return await this.gameRepository.createQueryBuilder()
			.select()
			.where("winner = :winnerId", {winnerId: user.id})
			.orWhere("loser = :loserId", {loserId: user.id})
			.getMany();
	}

	public async deleteGame(body: DeleteGameDto): Promise<number | null> {
		const { gameId }: DeleteGameDto = body;

		return (await this.gameRepository.createQueryBuilder()
			.delete()
			.where("id = :gameId", {gameId: gameId})
			.execute()).affected;
	}

	private recalculateELO(winner: User, loser: User): User[] {
		if (loser.score == 0)
			return [winner, loser];
		let delta: number =  (loser.score - winner.score) / 400;
		let total: number = 1 / (1 + Math.pow(10, delta));
		let k: number = (winner.id < 2100 && loser.id < 2100) ? 32 : ( (winner.id <= 2400 && loser.id <= 2400) ? 24 : 16);
		total = k * (1 - total);
		winner.score += Math.floor(total);
		loser.score -= Math.floor(total);
		++winner.gamesNumber;
		++loser.gamesNumber;
		return [winner, loser];
	}
}
