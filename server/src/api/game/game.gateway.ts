import { GameService, IGames } from './game.service';
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

interface Coordonates {
	x: number;
	y: number;
}

interface Corners {
	top_left: Coordonates;
	down_right: Coordonates;
}

//essentially will be a huge set of methods with some emissions from every side
	//players just have to send their position to server and receive => the other position, the ball position 
//find a solution to manage the game's framerate (thought to use setInterval but doesn't seem perfect)
class Pong {
	private pos_1: Coordonates;
	private pos_2: Coordonates;
	private size_1: Coordonates;
	private size_2: Coordonates;
	private old_1: Coordonates;
	private old_2: Coordonates;
	private ball: Coordonates;
	private old_ball: Coordonates;
	private ball_size: Coordonates;
	private direction: Coordonates;
	private speed: number;

	private score_1: number;
	private score_2: number;

	private framerate: number;
	private cooldown: number;
	private framecount: number;

	constructor(framerate: number, cooldown: number) {
		this.speed = 1 ;
		this.direction = {x: 1, y: 0};
		this.size_1 = {x: 10, y: 50};
		this.size_2 = {x: 10, y: 50};
		this.pos_1 = {x: 100, y: 500};
		this.pos_2 = {x: 900, y: 500};
		this.old_1 = {x: 100, y: 500};
		this.old_2 = {x: 900, y: 500};
		this.ball_size = {x: 10, y: 10};
		this.ball = {x: 500, y: 500};
		this.old_ball = {x: 500, y: 500};
		this.score_1 = 0;
		this.score_2 = 0;
		this.framerate = framerate;
		this.cooldown = cooldown;
	}

	update(): any {
		//cooldown before starting the game
		if (!this._check_cooldown()) {
			return ;
		}


	}



	/* PRIVATE METHODS */

	_check_borders(ball: Coordonates, size: Coordonates): boolean {
		if (ball.y + (size.y / 2) >= 1000 || ball.y - (size.y / 2) <= 0) {
			return true;
		}
		return false;
	}

	_check_limits(ball: Coordonates): boolean {
		if (ball.x >= 1000 || ball.x <= 0) {
			return true;
		}
		return false;
	}

	//left = top left, right = down right
	_get_corners(pos: Coordonates, size: Coordonates): Corners {
		return (
			{top_left: {
				x: pos.x - (size.x / 2),
				y: pos.y - (size.y / 2)
			},
			down_right: {
				x: pos.x + (size.x / 2),
				y: pos.y + (size.y / 2)
			}
		});
	}

	_check_rectangle_intersection(player: Corners, ball: Corners): boolean {
    	// If one rectangle is on left side of other
		if (player.top_left.x > ball.down_right.x || ball.top_left.x > player.down_right.x)
        	return false;
   		// If one rectangle is above other
    	else if (player.down_right.y > ball.top_left.y || ball.down_right.y > player.top_left.y)
        	return false;
    return true;
	}

	_check_cooldown(): boolean {
		if (this._seconds_by_frames() < this.cooldown) {
			this.framecount++;
			return false;
		}
		return true;
	}

	_seconds_by_frames(): number {
		return this.framecount / this.framerate;
	}

}

@WebSocketGateway({namespace: "game"})
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
		@Inject(GameService)
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
		this.playing.delete(this.clients.get(client.id));
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
	async handleUpdate(client: Socket) {
		const user: User = await this.userService.userById(this.clients.get(client.id))
		this._updatePlayer(client, user);
	}

	async _startGame(game: IGame, client: Socket): Promise<boolean> {
		//we check if everyone is connected and not playing
		if (
			!this.playing.has(game.player1.id) || 
			!this.playing.has(game.player2.id) ||
			this.playing.get(game.player1.id) ||
			this.playing.get(game.player2.id)
		) {
			return false;
		}

		//they are now officially playing
		this.playing.set(game.player1.id, true);
		this.playing.set(game.player2.id, true);

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
		this.playing.set(player.id, true);
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

		this.playing.set(game.player1.id, false);
		this.playing.set(game.player2.id, false);
	}

	async _updatePlayer(client: Socket, user: User) {
		//we get all related games with the user
		let games: IGames = await this.gameService.allGames(user);

		//we set all pending match for this user
		for (let index = 0; index < games.pending.length; index++) {
			const game: Game = games.pending[index];
			if (!this.channels.has(game.address)) {
				this.channels.set(game.address, {
					game: game, 
					player1: await this.userService.userById(game.winner_id), 
					player2: await this.userService.userById(game.loser_id)
				});
			}
			client.join(game.address);
		}
		const pending: Game = games.pending.find(game => game.type == GameType.competitive && game.winner != null && game.loser != null);

		//we check if a game can start with user right now
		if (games.ongoing && games.ongoing != undefined) {
			client.join(games.ongoing.address);
			this._recoverGame(this.ongoing.find( game => game.game.id == games.ongoing.id), user);
		}
		//if competitive is full let's start a pending game
		else if (pending != undefined && pending) {
			this._startGame(this.channels.get(pending.address), client);
		}
		//if no waiting competitive and friendly is full let's start a pending game
		else if (
			games.pending.find(game => game.type == GameType.competitive) == undefined && 
			games.pending.find(game => game.winner != null && game.loser != null) != undefined
		) {
			this._startGame(this.channels.get(games.pending.find(game => game.winner != null && game.loser != null).address), client);
		}
	}

}
