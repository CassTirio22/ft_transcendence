import { GameService } from './game.service';
import { Game } from './game.entity';
import { MessageService } from './../message/message.service';
import { FriendshipService } from './../user/friendship/friendship.service';
import { UserGatewayUtil, ConnectionMessage } from './../user/user.gateway';
import { User, UserStatus } from './../user/user.entity';
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
import { isArgumentsObject } from 'util/types';


interface IGame {
	game: Game;
	player1: Player;
	player2: Player;
}

interface Player {
	user: User;
	socket: Socket;
}

//ball position will always be calculated server-side
interface PongMessage {
	pos_1: number;
	pos_2: number;
}

//essentially will be a huge set of methods with some emissions from every side
	//players just have to send their position to server and receive => the other position, the ball position 
//find a solution to manage the game's framerate (thought to use setInterval but doesn't seem perfect)
class Pong {
	constructor() {}

}

@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
	private waiters: Map<Socket, User>;
	private games: IGame[];
	private util:	UserGatewayUtil;

	constructor(
		@Inject(AuthHelper)
		private authHelper: AuthHelper,
		@Inject(UserService)
		private userService: UserService,
		@Inject(FriendshipService)
		private friendshipService: FriendshipService,
		@Inject(MessageService)
		private messageService: MessageService,
		@Inject(GameService)
		private gameService: GameService,
		) {
			this.waiters = new Map<Socket, User>();
			this.games = [];
			this.util = new UserGatewayUtil(friendshipService, userService, messageService);
		}


	async afterInit(): Promise<any | never> {
		//loop all 10secs
		//check if disconnected
		setInterval(() => {
			//method to order the list and match people
		}, 1000);
	}

    async handleConnection(client: Socket, ...args: any[]): Promise<any | never> {
		try {
			//manage auth
			const token: string = <string>client.handshake.headers.authorization;
			const user: User = await this.authHelper.getUser(token);
			if ( await this.userService.inGame(user.id) == 0 )
				throw new Error("Unauthorized");
			this.waiters.set(client, user);

			//emit connection to friends
			// const message: ConnectionMessage = {user_id: user.id, status: true};
			//WILL HAVE TO NOTIFY PEOPLE ON USER GATEWAY SIDE !!! (it is still running, client can send messages on both)
			// this.util.emitToFriends(this.clients, client.id, message, this.util.emitConnection);
			// this.util.emitConnection(client, message);
		}
		catch (error) {
			client.emit('error', {message: 'Connection unauthorized.'});
			client.disconnect();
		}
	}

    async handleDisconnect(client: Socket): Promise<any> {
		//out of game, the rest is DB problem
		if (this.waiters.has(client)) {
			await this.userService.outGame(this.waiters.get(client).id);
			this.waiters.delete(client);
		}
		else {
			this.games.forEach( (game, index) => {
				if (game.player1.socket == client || game.player2.socket == client) {
					//service for interruption
					this.gameService.updateGame({
						gameId: game.game.id,
						winnerId: game.game.winner_id,
						winnerScore: 0,
						loserScore: 0,
						didInterrupt: true
					}); //put players as online in DB anyway
					this.games.splice(index);
				}
			});
		}
		client.rooms.forEach( room => { client.leave(room) } );
		//SIMILAR DIFFICULTY THAN CONNECTION =>
			//notify the others, probably more on the other gateway side
	}

	//let's think more about UI
	//user1 ask user2 to play => user1 connects to this gateway and is in waiters? bad idea
	//my handle connection must check what is the connection situation
	//in body during connection the client must say either:s
		//I must be in the wait list => already managed
		//I am waiting for someone to join me (channel) => directly creating a waiting IGame
		//I am inviting someone (friend) => directly creating a waiting IGame (can be interrupted of the other refuses)



	// @SubscribeMessage("friendly")
	// async handleFriendlyGame(client: Socket, data: number) {
	// 	//try catch the DB method to see if possible
	// 	try {
	// 		this.gameService.startUserGame( , false);
	// 	}
	// 	catch {

	// 	}
	// 	const gameInterface: IGame = {game: null, player1: null, player2: null};
		//add them in 'players' array
		//start game mate

	// }
}
