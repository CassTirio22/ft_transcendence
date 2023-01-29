import { GameService, AllGames } from './game.service';
import { Game, GameType } from './game.entity';
import { FriendshipService } from './../user/friendship/friendship.service';
import { User } from './../user/user.entity';
import { UserService } from './../user/user.service';
import { AuthHelper } from './../user/auth/auth.helper';
import { Inject } from "@nestjs/common";
import { 
	OnGatewayConnection, 
	OnGatewayDisconnect, 
	OnGatewayInit, 
	SubscribeMessage, 
	WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

interface IGame {
	game: Game;
	player1: User;
	player2: User;
}

//essentially will be a huge set of methods with some emissions from every side
	//players just have to send their position to server and receive => the other position, the ball position 
//find a solution to manage the game's framerate (thought to use setInterval but doesn't seem perfect)
class Pong {
	constructor() {}

}

@WebSocketGateway( { path: '/game' } )
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private channels: Map< string, IGame >;
	private playing: Map< number, boolean >;
	private clients: Map<string, number>;
	private ongoing: IGame[];

	constructor(
		@Inject(AuthHelper)
		private authHelper: AuthHelper,
		@Inject(UserService)
		private userService: UserService,
		@Inject(FriendshipService)
		private gameService: GameService,
		) {
			this.channels = new Map<string, IGame>();
			this.playing = new Map<number, boolean>;
			this.clients = new Map<string, number>;
			this.ongoing = [];
		}


	
	async afterInit(): Promise<any | never> {
		//loop all 10secs
		//check if disconnected
		// setInterval(() => {}, 1000);
	}

    async handleConnection(client: Socket, args: any): Promise<any | never> {
		try {
			//manage auth
			const token: string = <string>client.handshake.headers.authorization;
			const user: User = await this.authHelper.getUser(token);

			//we add it to the list of connected clients
			this.playing.set(user.id, false);
			this.clients.set(client.id, user.id);

			this._updatePlayer(client, user);
		}
		catch (error) {
			client.emit('error', {message: 'Connection unauthorized.'});
			client.disconnect();
		}
	}

    async handleDisconnect(client: Socket): Promise<any> {
		client.rooms.forEach( room => { client.leave(room) } );
		this.playing.delete(this.clients[client.id]);
		this.clients.delete(client.id);
	}

	@SubscribeMessage("watch")
	handleWatch(client: Socket, data: string) {
		if (this.channels.has(data)) {
			client.join(data);
		}
	}

	@SubscribeMessage("leave")
	handleLeave(client: Socket, data: string) {
		if (this.channels.has(data)) {
			client.leave(data);
		}
	}

	@SubscribeMessage("update")
	handleUpdate(client: Socket) {
		this._updatePlayer(client, this.clients[client.id]);
	}

	async _startGame(game: IGame, client: Socket): Promise<boolean> {
		//we check if everyone is connected and not playing
		if (
			!this.playing.has(game.player1.id) || 
			!this.playing.has(game.player2.id) ||
			this.playing[game.player1.id] ||
			this.playing[game.player2.id]
		) {
			return false;
		}

		//they are now officially playing
		this.playing[game.player1.id] = true;
		this.playing[game.player2.id] = true;

		//telling to anyone joined to this game that it will start
		client.to(game.game.address).emit('start', game.game.address);
		client.emit('start', game.game.address);

		//game is ongoing in DB
		await this.gameService.ongoingGame(game.game.id);
		//adding the game to the ongoing games in socket
		this.ongoing.push(game);
		return true;
	}

	async _recoverGame(game: IGame, player: User) {
		//they are automatically officially playing
		this.playing[player.id] = true;
	}

	async _endGame(game: IGame) {
		this.gameService.updateGame( {
			address: game.game.address,
			winnerId: game.game.winner.id,
			winnerScore: game.game.winnerScore,
			loserScore: game.game.loserScore,
			didInterrupt: false,
		});
		this.channels.delete(game.game.address);
		this.ongoing.splice( this.ongoing.indexOf(game));

		this.playing[game.player1.id] = false;
		this.playing[game.player2.id] = false;
	}

	async _updatePlayer(client: Socket, user: User) {
		//we get all related games with the user
		let games: AllGames = await this.gameService.allGames(user);

		//we set all pending match for this user
		games.pending.forEach( game => {
			if (!this.channels.has(game.address)) {
				this.channels.set(game.address, {game: game, player1: null, player2: null});
			}
			this.channels[game.address].player1 = (game.winner_id == user.id) ? client : this.channels[game.address].player1;
			this.channels[game.address].player2 = (game.loser_id == user.id) ? client : this.channels[game.address].player2;
			client.join(game.address);
		});
		const pending: Game = games.pending.find(game => game.type == GameType.competitive && game.winner != null && game.loser != null);

		//we check if a game can start with user right now
		if (games.ongoing) {
			client.join(games.ongoing.address);
			this._recoverGame(this.ongoing.find( game => game.game.id == games.ongoing.id), user);
		}
		//if competitive is full let's start a pending game
		else if (pending != undefined) {
			this._startGame(this.channels[pending.address], client);
		}
		//if no waiting competitive and friendly is full let's start a pending game
		else if (
			games.pending.find(game => game.type == GameType.competitive) == undefined && 
			games.pending.find(game => game.winner != null && game.loser != null) != undefined
		) {
			this._startGame(this.channels[games.pending.find(game => game.winner != null && game.loser != null).address], client);
		}
	}

}
