import { ChannelService } from './../message/channel/channel.service';
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {Game, GameType, GameStatus} from './game.entity';
import { UpdateGameDto, JoinGameDto, CreateGameDto } from './game.dto';
import { User, UserStatus } from '../user/user.entity';
import { generate } from 'shortid';


export interface IGames {
	done: Game[],
	pending: Game[],
	ongoing: Game,
}

interface GameSettings {
	winner_id: number;
	loser_id: number;
	type: GameType;
	status: GameStatus;
	address: string;
}

interface UpdateGameSettings {
	address:		string;
	interrupted:	boolean;
	winner:			User;
	loser:			User;
	winnerScore:	number;
	loserScore:		number;
	elo:			number;
	coins:			number;
}  

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Game)
		private readonly gameRepository: Repository<Game>,
		@Inject(ChannelService)
		private channelService: ChannelService,
	){}

	//only in competitive
	public async matchmaking(user: User) : Promise<Game | never> {
		let games: Game[] = (await this.gameRepository.createQueryBuilder()
			.select()
			.where("loser_id IS NULL")
			.andWhere("winner_id != :userId", {userId: user.id})
			.getMany());
		if (games.length > 0) {
			await this.gameRepository.createQueryBuilder()
				.update()
				.where("address = :addressId", {addressId: games[0].address})
				.set({loser: user})
				.execute();
			return await this.gameRepository.createQueryBuilder()
				.select()
				.where("address = :addressId", {addressId: games[0].address})
				.getOne();
		}
		return await this.create({friendly: false}, user);
	}


	public async create(body: CreateGameDto, user: User) : Promise<Game | never> {
		let game: Game =  await this.gameRepository.createQueryBuilder()
			.select()
			.where(new Brackets( query => { query
				.where("status = :gameOngoing", {gameOngoing: GameStatus.ongoing})
				.orWhere(new Brackets( query => { query
					.where("status = :gamePending", {gamePending: GameStatus.pending})
					.andWhere("type = :gameType", {gameType: GameType.competitive})
				}))
			}))
			.andWhere(new Brackets( query => { query
				.where("winner_id = :winnerId", {winnerId: user.id})
				.orWhere("loser_id = :loserId", {loserId: user.id})
			}))
			.getOne();
		if (game) {
			return game;
		}
		game =  (await this.gameRepository.createQueryBuilder()
			.insert()
			.values({
				winner: user, 
				type: body.friendly ? GameType.friendly : GameType.competitive, 
				address: generate(),
			})
			.execute())
		.generatedMaps[0] as Game;
		return await this.gameRepository.createQueryBuilder()
			.select()
			.where("id = :gameId", {gameId: game.id})
			.getOne();
	}


	//SHOULD I PUT THE STATUS ON ONGOING RIGHT NOW?
	public async updateGame(body: UpdateGameDto): Promise<number> {
		const { address, winnerId, winnerScore, loserScore, didInterrupt}: UpdateGameDto = body;

		let game: any = await this.gameRepository.createQueryBuilder('game')
			.innerJoinAndSelect("game.winner", "winner")
			.innerJoinAndSelect("game.loser", "loser")
			.where("game.address = :gameAddress", {gameAddress: address})
			.andWhere("game.status = :ongoingStatus", {ongoingStatus: GameStatus.ongoing})
			.andWhere(":winnerId IN (winner.id, loser.id)", {winnerId: winnerId})
			.getOne();
		if (!game) {
			throw new HttpException('Not found. Did not found a game with those criterias.', HttpStatus.NOT_FOUND);
		}
		let settings: UpdateGameSettings = {
			address: address,
			interrupted: false,
			winner: (game.winner.id == winnerId) ? game.winner : game.loser,
			loser: (game.winner.id == winnerId) ? game.loser : game.winner,
			winnerScore: winnerScore,
			loserScore: loserScore,
			elo: 0,
			coins: game.type == GameType.competitive ? game.winner.coins + 50 : game.winner.coins
		};
		if (game.type == GameType.competitive) {
			settings = this._recalculateELO(settings);
		}
		if (game.type == GameType.friendly) {
			settings.elo = 0;
		}
		await this._updatePlayers(settings);
		return (await this._updateGame(settings));
	}

	public async updateScore(body: {address: string, player_1: number, player_2: number}): Promise<number> {
		return (await this.gameRepository.createQueryBuilder()
			.update()
			.where("address = :gameAddress", {gameAddress: body.address})
			// .andWhere("status = :gameStatus", {gameStatus: GameStatus.ongoing})
			.set({winnerScore: body.player_1, loserScore: body.player_2})
			.execute()).affected;
	}

	public async joinGame(body: JoinGameDto, user: User): Promise<number> {
		const { address }: JoinGameDto = body;

		// have debug here

		let games: Game[] = await this.gameRepository.createQueryBuilder()
			.select()
			.where(':userId IN (winner_id, loser_id)', {userId: user.id})
			.andWhere("status = :gameStatus", {gameStatus: GameStatus.pending})
			.orWhere(new Brackets( query => { query
				.where('address = :gameAddress', {gameAddress: address})
				.andWhere('loser_id IS NULL')
			}))
			.getMany();
		if (games.length == 0) {
			throw new HttpException('Not found. Did not found a game with those criterias.', HttpStatus.NOT_FOUND);
		}
		// else if ( games.length > 1 || games[0].address != address || user.id == games[0].winner_id) {
		// 	throw new HttpException('Conflict. You seem to already be playing a game.', HttpStatus.CONFLICT);
		// }
		return (await this.gameRepository.createQueryBuilder()
			.update()
			.set({loser: user})
			.where('address = :gameAddress', {gameAddress: address})
			.execute()).affected;
	}

	public async games(id: number): Promise< Game[] | never> {
		return await this.gameRepository.createQueryBuilder("game")
			.innerJoinAndSelect("game.winner", "winner")
			.innerJoinAndSelect("game.loser", "loser")
			.select()
			.where(":player IN (winner.id, loser.id)", {player: id})
			.andWhere("game.status = :gameStatus", {gameStatus: GameStatus.done})
			.orderBy("game.date", 'ASC')
			.getMany();
	}

	public async currentGame(user: User): Promise<Game | never> {
		return await this.gameRepository.createQueryBuilder("game")
			.innerJoinAndSelect("game.winner", "winner")
			.innerJoinAndSelect("game.loser", "loser")
			.select()
			.where("game.status = :gameStatus", {gameStatus: GameStatus.ongoing})
			.andWhere(":userId IN (winner.id, loser.id)", {userId: user.id})
			.getOne();
	}

	public async abortMatchmaking(id: number): Promise<number | never> {
		return (await this.gameRepository.createQueryBuilder("game")
			.innerJoin("game.winner", "winner")
			.innerJoin("game.loser", "loser")
			.delete()
			.where("game.type = :gameType", {gameType: GameType.competitive})
			.andWhere("winner.id = :userId", {userId: id})
			.andWhere("loser IS NULL")
			.execute()).affected;
	}

	public async allCurrents(): Promise<Game[] | never> {
		return await this.gameRepository.createQueryBuilder("game")
			.leftJoinAndSelect("game.winner", "winner")
			.leftJoinAndSelect("game.loser", "loser")
			.select()
			.where("game.status = :gameStatus", {gameStatus: GameStatus.ongoing})
			.getMany();
	}

	public async gameByAddress(address: string): Promise<Game | never> {
		return await this.gameRepository.createQueryBuilder("game")
			.leftJoinAndSelect("game.winner", "winner")
			.leftJoinAndSelect("game.loser", "loser")
			.select()
			.where("game.address = :gameAddress", {gameAddress: address})
			.getOne();
	}

	public async allGames(user: User): Promise< IGames | never > {
		const games: Game[] = await this.gameRepository.createQueryBuilder("game")
			.innerJoinAndSelect("game.winner", "winner")
			.leftJoinAndSelect("game.loser", "loser")
			.select()
			.where(":player IN (winner.id, loser.id)", {player: user.id})
			.orderBy("game.date", 'ASC')
			.getMany();
		let all: IGames = {done: [], pending: [], ongoing: null};
		games.forEach( game => {
			if (game.status == GameStatus.done) {
				all.done.push(game);
			}
			else if (game.status == GameStatus.ongoing) {
				all.ongoing = game;
			}
			else if (game.status == GameStatus.pending/* && game.winner_id == user.id*/) {
				all.pending.push(game);
			}
		} )
		return all;
	}

	public async pendingGames(): Promise<Game[] | never> {
		return await this.gameRepository.createQueryBuilder("game")
			.select()
			.andWhere("game.status = :gameStatus", {gameStatus: GameStatus.pending})
			.orderBy("game.date", 'ASC')
			.getMany();
	}

	public async deleteGame(gameId: number): Promise<number | null> {
		return (await this.gameRepository.createQueryBuilder()
			.delete()
			.where("id = :gameId", {gameId: gameId})
			.execute()).affected;
	}

	public async ongoingGame(gameId: number) : Promise <number> {
		return (await this.gameRepository.createQueryBuilder()
			.update()
			.where("id = :gameId", {gameId: gameId})
			.set({status: GameStatus.ongoing})
			.execute()).affected;
	}

	private async _updateGame(settings: UpdateGameSettings): Promise<number> {
		return ( await this.gameRepository.createQueryBuilder()
		.update(Game)
		.set({
			status: GameStatus.done,
			loser: settings.loser,
			winner: settings.winner,
			winnerScore: settings.winnerScore,
			loserScore: settings.loserScore,
			elo: settings.elo,
		})
		.where("address = :addressId", {addressId: settings.address})
		.execute()).affected;
	}

	private async _updatePlayers(players: UpdateGameSettings): Promise<number> {
		let query: any = this.userRepository.createQueryBuilder().update();
		if (players.interrupted)
			query = query.set({status: UserStatus.online});
		else
			query = query.set ({
				gamesNumber: () => `CASE WHEN id = ${players.loser.id} THEN ${players.loser.gamesNumber} ELSE ${players.winner.gamesNumber} END`,
				score: () => `CASE WHEN id = ${players.loser.id} THEN ${players.loser.score} ELSE ${players.winner.score} END`,
				coins: () => `CASE WHEN id = ${players.loser.id} THEN ${players.loser.coins} ELSE ${players.coins} END`,
				status: UserStatus.online
			});
		return (await query
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
		players.elo = Math.floor(total);
		players.winner.score += players.elo;
		players.loser.score -= players.elo;
		++players.winner.gamesNumber;
		++players.loser.gamesNumber;
		return players;
	}
}
