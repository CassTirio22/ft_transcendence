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
	pong: Pong;
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

interface Inputs {
	up: boolean;
	down: boolean;
}

interface Update {
	player_1: Coordonates;
	player_2: Coordonates;
	ball: Coordonates;
}

interface Score {
	player_1: number;
	player_2: number;
}

//essentially will be a huge set of methods with some emissions from every side
	//players just have to send their position to server and receive => the other position, the ball position 
//find a solution to manage the game's framerate (thought to use setInterval but doesn't seem perfect)
class Pong {
	private player_speed: number = 17;
	public address: string;

	public player_1: number;
	public player_2: number;

	public pos_1: Coordonates;
	public pos_2: Coordonates;
	public size_1: Coordonates;
	public size_2: Coordonates;
	public old_1: Coordonates;
	public old_2: Coordonates;
	public ball: Coordonates;
	public old_ball: Coordonates;
	public ball_size: Coordonates;
	public direction: Coordonates;
	public speed: number;

	public input_1: Inputs;
	public input_2: Inputs;

	public score_1: number;
	public score_2: number;

	public framerate: number;
	public cooldown: number;
	public framecount: number;

	constructor(framerate: number, cooldown: number, address: string, player1: number, player2: number) {
		this.speed = 1;
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
		this.input_1 = {up: false, down: false};
		this.input_2 = {up: false, down: false};
		this.address = address;
		this.player_1 = player1;
		this.player_2 = player2;
	}

	//I need the id of the 2 users, i need the address of the game
	//true == continue
	update(playing: Map< number, {client: Socket, isPlaying: boolean} >): boolean {
		//cooldown before starting the game

		if (this.score_1 > 2 || this.score_2 > 2) {
			playing.get(this.player_1).client.to(this.address).emit("end", "");
			playing.get(this.player_1).client.emit("end", "");
			return false;
		}

		this._update_player_position();
		// if (!this._check_cooldown()) {
		// 	return true;
		// }
		this._update_ball_position();
		if (playing.has(this.player_1)) {
			this._check_limits(playing.get(this.player_1).client);
		}
		else if (playing.has(this.player_2)) {
			this._check_limits(playing.get(this.player_2).client);
		}


		const updt: Update = this._create_update_struct();
		if (playing.has(this.player_1)) {
			playing.get(this.player_1).client.to(this.address).emit("update", updt);
			playing.get(this.player_1).client.emit("update", updt);
		}
		else if (playing.has(this.player_2)) {
			playing.get(this.player_2).client.to(this.address).emit("update", updt);
			playing.get(this.player_2).client.emit("update", updt);
		}
		return true;
	}



	/* PRIVATE METHODS */

	_update_player_position() {
		if (
			this.input_1.down && 
			!this.input_1.up && 
			this.pos_1.y + (this.size_1.y * 0.5) < 1000
		) {
			this.pos_1.y += this.player_speed;
		}
		else if (
			this.input_1.up &&
			!this.input_1.down &&
			this.pos_1.y - (this.size_1.y * 0.5) > 0
		) {
			this.pos_1.y -= this.player_speed;
		}
		if (
			this.input_2.down &&
			!this.input_2.up &&
			this.pos_2.y + (this.size_2.y * 0.5) < 1000
		) {
			this.pos_2.y += this.player_speed;
		}
		else if (
			this.input_2.up &&
			!this.input_2.down &&
			this.pos_2.y - (this.size_2.y * 0.5) > 0
		) {
			this.pos_2.y -= this.player_speed;
		}
	}

	_create_update_struct() : Update {
		return {
			player_1: this.pos_1,
			player_2: this.pos_2,
			ball: this.ball
		};
	}

	_update_ball_position() {
		this._ball_acceleration();
		const tmp: Coordonates = {x: this.direction.x * this.speed, y: this.direction.y * this.speed};
		this.ball = this._sum_coordonates(this.ball, tmp);
	}

	_ball_acceleration() {
		this.speed += this.speed * 0.0001;
	}

	_check_borders(ball: Coordonates, size: Coordonates): boolean {
		if (ball.y + (size.y / 2) >= 1000 || ball.y - (size.y / 2) <= 0) {
			return true;
		}
		return false;
	}

	_check_limits(client: Socket): boolean {
		if (this.ball.x >= 1000 ) {
			this.score_1++;
			this._reset_ball();
			client.to(this.address).emit("score", {player_1: this.score_1, player_2: this.score_2});
			client.emit("score", {player_1: this.score_1, player_2: this.score_2});
			return true;
		}
		else if (this.ball.x <= 0 ) {
			this.score_2++;
			this._reset_ball();
			client.to(this.address).emit("score", {player_1: this.score_1, player_2: this.score_2});
			client.emit("score", {player_1: this.score_1, player_2: this.score_2});
			return true;
		}
		return false;
	}

	_bounce_border() {
		this.direction = {
			x: this.direction.x,
			y: -this.direction.y
		};
	}

	_bounce_player() {
		this.direction = {
			x: -this.direction.x,
			y: -this.direction.y
		}
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

	_reset_ball(): any {
		this.framecount = 0;
		this.speed = 1;
		this.ball = {x: 500, y: 500};
		let x: number = Math.random() * 2 - 1;
		if (x === 0) {
  			x = Math.random() < 0.5 ? -1 : 1;
		}
		this.direction = {x: x, y: 0};
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

	_sum_coordonates(A: Coordonates, B: Coordonates): Coordonates {
		return {
			x: A.x + B.x,
			y: A.y + B.y
		}
	}
}



@WebSocketGateway({namespace: "game"})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private channels: Map< string, IGame >;
	private playing: Map< number, {client: Socket, isPlaying: boolean} >;
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
		this.playing = new Map<number, {client: Socket, isPlaying: boolean}>();
		this.clients = new Map<string, number>();
		this.ongoing = [];
	}
	
	async afterInit(): Promise<any | never> {
		//loop all 10secs
		//check if disconnected
		setInterval(() => {
			this.ongoing.forEach( game => {
				if (!game.pong.update(this.playing)) {
					this._endGame(game);
				}
			})
		}, 17);
	}

    async handleConnection(client: Socket, args: {address: string}): Promise<any | never> {
		try {
			// manage auth
			const token: string = <string>client.handshake.headers.authorization;
			const user: User = await this.authHelper.getUser(token);

			//we add it to the list of connected clients
			this.playing.set(user.id, {client: client, isPlaying: false});
			this.clients.set(client.id, user.id);

			await this._updatePlayer(client, user, args != undefined ? args.address : null);
		}
		catch (error) {
			client.emit('error', {message: 'Connection unauthorized.'});
			client.disconnect();
		}
	}

    async handleDisconnect(client: Socket): Promise<any> {
		client.rooms.forEach( room => { client.leave(room) } );
		if (this.clients.get(client.id) != undefined) {
			this.playing.delete(this.clients.get(client.id));
		}
		if (this.clients.get(client.id) != undefined) {
			this.clients.delete(client.id);
		}
	}

	@SubscribeMessage("update")
	async handleUpdate(client: Socket, args: {address: string}) {
		const user: User = await this.userService.userById(this.clients.get(client.id))
		this._updatePlayer(client, user, args.address);
	}

	@SubscribeMessage("input")
	async handleInput(client: Socket, data: Inputs) {
		if (this.clients.has(client.id) && this.playing.get(this.clients.get(client.id))) {
			for (let index = 0; index < this.ongoing.length; index++) {
				if (this.ongoing[index].player1.id == this.clients.get(client.id)) {
					this.ongoing[index].pong.input_1 = data;
				}
				else if (this.ongoing[index].player2.id == this.clients.get(client.id)) {
					this.ongoing[index].pong.input_2 = data;
				}
			}
		}
	}

	async _startGame(game: IGame, client: Socket, user: User): Promise<boolean> {
		//we check if everyone is connected and not playing
		this.playing.set(user.id, {client: client, isPlaying: false});
		if (
			!this.playing.has(game.player1.id) || 
			!this.playing.has(game.player2.id) ||
			this.playing.get(game.player1.id).isPlaying ||
			this.playing.get(game.player2.id).isPlaying
		) {
			return false;
		}

		//they are now officially playing
		this.playing.set(game.player1.id, {client: client, isPlaying: true});
		this.playing.set(game.player2.id, {client: client, isPlaying: true});

		//telling to anyone joined to this game that it will start
		client.to(game.game.address).emit('start', game.game.address);
		client.emit('start', game.game.address);

		//game is ongoing in DB
		await this.gameService.ongoingGame(game.game.id);
		//adding the game to the ongoing games in socket
		this.ongoing.push(game);
		return true;
	}

	async _recoverGame(game: IGame, player: User, client: Socket) {
		//they are automatically officially playing
		this.playing.set(player.id, {client: client, isPlaying: true});
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

		this._disconnnect_player(game.player1.id);
		this._disconnnect_player(game.player2.id);
	}

	async _updatePlayer(client: Socket, user: User, address: string) {
		//we get all related games with the user
		let games: IGames = await this.gameService.allGames(user);

		//we set all pending match for this user
		for (let index = 0; index < games.pending.length; index++) {
			const game: Game = games.pending[index];
			if (!this.channels.has(game.address)) {
				this.channels.set(game.address, {
					game: game,
					player1: await this.userService.userById(game.winner_id), 
					player2: await this.userService.userById(game.loser_id),
					pong: new Pong(1, 3, game.address,game.winner_id, game.loser_id)
				});
			}
			client.join(game.address);
		}
		const pending: Game = games.pending.find(game => game.type == GameType.competitive && game.winner != null && game.loser != null);
		const joinable: Game = games.pending.find(game => game.address == address);

		//we check if a game can start with user right now
		if (games.ongoing && games.ongoing != undefined) {
			client.join(games.ongoing.address);
			this._recoverGame(this.ongoing.find( game => game.game.id == games.ongoing.id), user, client);
		}
		//if competitive is full let's start a pending game
		else if (pending && pending != undefined) {
			client.emit("join", {address: pending.address});
			console.log(pending)
			this._startGame(this.channels.get(pending.address), client, user);
		}
		//if no waiting competitive we want to play a friendly
		else if (address && joinable && joinable != undefined) {
			//no 2nd player => join the game
			if (joinable.loser == null) {
				await this.gameService.joinGame({address: joinable.address}, user);
				client.emit("join", {address: joinable.address});
				this._startGame(this.channels.get(games.pending.find(game => game.winner != null && game.loser != null).address), client, user);
			}
			//else watch the game
			else {
				client.join(joinable.address);
				client.emit("watch", {address: joinable.address});
			}
		}
		else {
			this._disconnnect_player(user.id);
		}
	}

	_disconnnect_player(user: number): any {
		if (this.playing.get(user) == undefined)
			return ;
		const client: Socket = this.playing.get(user).client;
		client.rooms.forEach( room => { client.leave(room) } );
		this.playing.delete(this.clients.get(client.id));
		this.clients.delete(client.id);
		client.disconnect();
	}

}
