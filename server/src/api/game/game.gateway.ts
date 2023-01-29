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
	WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

interface IGame {
	game: Game;
	player1: Socket;
	player2: Socket;
}

//essentially will be a huge set of methods with some emissions from every side
	//players just have to send their position to server and receive => the other position, the ball position 
//find a solution to manage the game's framerate (thought to use setInterval but doesn't seem perfect)
class Pong {
	constructor() {}

}

@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private channels: Map< string, IGame >;
	private playing: Map< string, boolean >;
	//must be a list of ongoing games

	constructor(
		@Inject(AuthHelper)
		private authHelper: AuthHelper,
		@Inject(UserService)
		private userService: UserService,
		@Inject(FriendshipService)
		private gameService: GameService,
		) {
			this.channels = new Map<string, IGame>();
			this.playing = new Map<string, boolean>;
		}


	async afterInit(): Promise<any | never> {
		//loop all 10secs
		//check if disconnected
		setInterval(() => {

		}, 1000);
	}

    async handleConnection(client: Socket, args: any): Promise<any | never> {
		try {
			//manage auth
			const token: string = <string>client.handshake.headers.authorization;
			const user: User = await this.authHelper.getUser(token);

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

			//we check if a game can start with user right now
			if (games.ongoing) {
				client.join(games.ongoing.address);
				// client.emit(); //GO TO YOUR ONGOING GAME MATE YOU'RE LOSING BECAUSE OF YOUR CONNECTION
			}
			//if competitive is full let's start an ongoing game
			else if (games.pending.find(game => game.type == GameType.competitive && game.winner != null && game.loser != null) != undefined) { 
				//GO TO NEW ONGOING GAME IF ALL CONNECTED AND WAITING
			}
			//if no waiting competitive and friendly is full let's start an ongoing game
			else if (
				games.pending.find(game => game.type == GameType.competitive) == undefined && 
				games.pending.find(game => game.winner != null && game.loser != null) != undefined
			){
				//GO TO NEW ONGOING GAME IF ALL CONNECTED AND WAITING
			}
			else {
				//add to a waiter list and notify when ok -> actually maybe do nothing since already joined to rooms
			}
		}
		catch (error) {
			client.emit('error', {message: 'Connection unauthorized.'});
			client.disconnect();
		}
	}

    async handleDisconnect(client: Socket): Promise<any> {
		client.rooms.forEach( room => { client.leave(room) } );
	}

	async _startGame(game: IGame): Promise<boolean> {
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

		//game is ongoing in DB
		// await this.gameService.updateGame()

		//
	}

}
