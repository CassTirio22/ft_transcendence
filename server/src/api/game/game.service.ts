import { Channel } from './../message/channel/channel.entity';
import { ChannelService } from './../message/channel/channel.service';
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {Game, GameType, GameStatus} from './game.entity';
import { DeleteGameDto, StartCompetitiveGameDto, StartFriendlyGameDto, UpdateGameDto, JoinGameDto } from './game.dto';
import { User, UserStatus } from '../user/user.entity';
import { Request } from 'express';
import { MemberStatus } from '../message/channel/member/member.entity';


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
		private readonly gameRepository: Repository<Game>,
		@Inject(ChannelService)
		private channelService: ChannelService,
	){}

	public async startUserGame(body: StartCompetitiveGameDto, competitive: boolean): Promise<Game | never> {
		const { player1Id, player2Id }: StartCompetitiveGameDto = body;

		let players: User[] = await this.userRepository.createQueryBuilder('user')
			.select()
			.leftJoinAndSelect("user.won", "won", "won.status = :wonGameState ", {wonGameState: GameStatus.ongoing})
			.leftJoinAndSelect("user.lost", "lost", "lost.status = :lostGameState ", {lostGameState: GameStatus.ongoing})
			.where("user.id IN (:...playerIds)", {playerIds: [player1Id, player2Id]})
			.getMany();
		if (players.length < 2) {
			throw new HttpException('Not found. Did not found users with those criterias.', HttpStatus.NOT_FOUND);
		}
		else if (players.length > 2 || players.map(p => p.won.length).concat(players.map(p => p.lost.length)).filter(n => n != 0).length > 0) {
			throw new HttpException('Conflict. A player seems to already be playing.', HttpStatus.CONFLICT);
		}
		return (await this.gameRepository.createQueryBuilder()
			.insert()
			.values({
				winner: players[0], 
				loser: players[1], 
				type: competitive ? GameType.competitive : GameType.friendly
			})
			.execute()).generatedMaps[0] as Game;
	}

	public async startChannelGame(body: StartFriendlyGameDto, req: Request): Promise<Game | never> {
		const user: User = <User>req.user;
		const { id }: StartFriendlyGameDto = body;

		let channel: Channel  = await this.channelService.channel(id, user.id);
		if (!channel) {
			throw new HttpException('Not found. Did not found channel with those criterias.', HttpStatus.NOT_FOUND);
		}
		else if (!channel.members[0] || channel.members[0].status != MemberStatus.regular) {
			throw new HttpException('Unauthorized. You are no member of this channel OR you have been banned/muted.', HttpStatus.UNAUTHORIZED);
		}
		let game: Game = await this.gameRepository.createQueryBuilder()
			.select()
			.where("status = :gameStatus", {gameStatus: GameStatus.ongoing} )
			.andWhere(new Brackets( query => { query
				.where("winner_id = :winnerId", {winnerId: user.id})
				.orWhere("loser_id = :loserId", {loserId: user.id})
			}))
			.getOne();
		if (game) {
			throw new HttpException('Conflict. You seem to be already playing a game.', HttpStatus.CONFLICT);
		}
		return (await this.gameRepository.createQueryBuilder()
			.insert()
			.values({winner: user, type: GameType.friendly, channel: id})
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
			throw new HttpException('Not found. Did not found a game with those criterias.', HttpStatus.NOT_FOUND);
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

	public async joinGame(body: JoinGameDto, req: Request): Promise<number> {
		const user: User = <User>req.user;
		const { game }: JoinGameDto = body;

		let games: Game[] = await this.gameRepository.createQueryBuilder()
			.select()
			.where(':userId IN (winner_id, loser_id)', {userId: user.id})
			.orWhere(new Brackets( query => { query
				.where('id = :gameId', {gameId: game})
				.andWhere('loser_id IS NULL')
			}))
			.getMany();
		if (games.length == 0) {
			throw new HttpException('Not found. Did not found a game with those criterias.', HttpStatus.NOT_FOUND);
		}
		if (games.length > 1 || games[0].id != game || user.id == games[0].winner_id) {
			throw new HttpException('Conflict. You seem to already be playing a game.', HttpStatus.CONFLICT);
		}
		return (await this.gameRepository.createQueryBuilder()
			.update()
			.set({loser: user})
			.where('id = :gameId', {gameId: game})
			.execute()).affected;
	}

	public async games(user: User): Promise< Game[] | never> {
		return await this.gameRepository.createQueryBuilder("game")
			.innerJoinAndSelect("game.winner", "winner")
			.innerJoinAndSelect("game.loser", "loser")
			.select()
			.where(":player IN (winner.id, loser.id)", {player: user.id})
			.andWhere("game.status = :gameStatus", {gameStatus: GameStatus.done})
			.orderBy("game.date", 'ASC')
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
		let query: any = this.userRepository.createQueryBuilder().update();
		if (players.interrupted)
			query = query.set({status: UserStatus.online});
		else
			query = query.set ({
				gamesNumber: () => `CASE WHEN id = ${players.loser.id} THEN ${players.loser.gamesNumber} ELSE ${players.winner.gamesNumber} END`,
				score: () => `CASE WHEN id = ${players.loser.id} THEN ${players.loser.score} ELSE ${players.winner.score} END`,
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
		players.winner.score += Math.floor(total);
		players.loser.score -= Math.floor(total);
		++players.winner.gamesNumber;
		++players.loser.gamesNumber;
		return players;
	}
}
