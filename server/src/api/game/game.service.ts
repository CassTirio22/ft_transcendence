import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeleteResult, getConnection, InsertResult, Repository, Not } from 'typeorm';
import {Game, GameType, GameStatus} from './game.entity';
import { DeleteGameDto, StartCompetitiveGameDto, StartFriendlyGameDto, UpdateGameDto} from './game.dto';
import { User } from '../user/user.entity';
import { Request, query } from 'express';
import { channel } from 'diagnostics_channel';


@Injectable()
export class GameService {
	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(Game)
	private readonly gameRepository: Repository<Game>;

	public async startCompetitiveGame(body: StartCompetitiveGameDto, req: Request): Promise<Game | never> {
		const user: User = <User>req.user;
		const { opponentId }: StartCompetitiveGameDto = body;

		// let qb = await this.gameRepository.createQueryBuilder();
		// let insertGame: string = await qb
		// 	.insert()
		// 	.into( qb => { const subQuery = qb
		// 		.subQuery()
		// 		.select()
		// 		.where("status = :gameStatus", {gameStatus: GameStatus.ongoing} )
		// 		.andWhere(new Brackets( query => { query
		// 			.where("winner IN (:...winnerIds)", {winnerIds: [opponentId, user.id]})
		// 			.orWhere("loser IN (:...loserIds)", {loserIds: [opponentId, user.id]})
		// 		}))
		// 		.getQuery()
		// 	})
		// 	.values({winner: user.id, loser:opponentId, type: GameType.competitive})
		// 	.orIgnore()
		// 	.getQuery();


		let game: Game = await this.gameRepository.createQueryBuilder()
													.select()
													.where("status = :gameStatus", {gameStatus: GameStatus.ongoing} )
													.andWhere(new Brackets( query => { query
														.where("winner IN (:...winnerIds)", {winnerIds: [opponentId, user.id]})
														.orWhere("loser IN (:...loserIds)", {loserIds: [opponentId, user.id]})
													}))
													.getOne();
		if (game) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}

		game = new Game();
		game.winner = user.id;
		game.loser = opponentId;
		game.type = GameType.competitive;

		return this.gameRepository.save(game);
	}

	public async startFriendlyGame(body: StartFriendlyGameDto, req: Request): Promise<Game | never> {
		const user: User = <User>req.user;
		const { channelId }: StartFriendlyGameDto = body;

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

		game = new Game();
		game.winner = user.id;
		game.type = GameType.friendly;
		game.channel = channelId;

		return this.gameRepository.save(game);
	}

	public async updateGame(body: UpdateGameDto): Promise<Game> {
		const { gameId, winnerId, winnerScore, loserScore, didInterrupt}: UpdateGameDto = body;

		let game: Game = await this.gameRepository.createQueryBuilder()
			.select()
			.where("id = :gameId", {gameId: gameId})
			.getOne();
		if (!game) {
			throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
		}
		else if (game.status != GameStatus.ongoing) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		game.status = didInterrupt ? GameStatus.interrupted : GameStatus.done
		game.loser = (game.winner == winnerId) ? game.loser : game.winner;
		game.winner = winnerId;
		game.winnerScore = winnerScore;
		game.loserScore = loserScore;

		if (!didInterrupt) {
			let users: User[] = await this.userRepository.createQueryBuilder()
				.select()
				.where("id IN (:...gamerIds)", {gamerIds: [game.winner, game.loser]})
				.getMany();
			let winner = (users[0].id == winnerId) ? users[0] : users[1];
			let loser = (users[0].id == winnerId) ? users[1] : users[0];
			if (!winner || !loser) {
				throw new HttpException('User not found', HttpStatus.NOT_FOUND);
			}
			++winner.gamesNumber;
			++loser.gamesNumber;
			users = this.recalculateELO(winner, loser);
			this.userRepository.save(users);
		}
	
		return this.gameRepository.save(game);
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

		let deleteGame: DeleteResult = await this.gameRepository.createQueryBuilder()
			.delete()
			.where("id = :gameId", {gameId: gameId})
			.execute();
		return deleteGame.affected;
	}

	/*
		chess situation :
		elo < 2100 -> K = 32
		elo >= 2100 && <= 2400 -> K = 24
		elo > 2400 -> K = 16
	*/
	private recalculateELO(winner: User, loser: User): User[] {
		if (loser.score == 0)
			return [winner, loser];
		let delta: number =  (loser.score - winner.score) / 400;
		let total: number = 1 / (1 + Math.pow(10, delta));
		let k: number = (winner.id < 2100 && loser.id < 2100) ? 32 : ( (winner.id <= 2400 && loser.id <= 2400) ? 24 : 16);
		total = k * (1 - total);
		winner.score += Math.floor(total);
		loser.score -= Math.floor(total);
		return [winner, loser];
	}
}
