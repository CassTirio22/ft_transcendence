import { BlockService } from '@/api/user/block/block.service';
import { MemberService } from './../message/channel/member/member.service';
import { GameService } from './game.service';
import { Game } from './game.entity';
import { MessageService } from './../message/message.service';
import { FriendshipService } from './../user/friendship/friendship.service';
import { UserGatewayUtil } from './../user/user.gateway';
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

class GameGatewayUtil {
	constructor(
		@Inject(GameService)
		private gameService: GameService,
	) {}

	public findGameByClient(client: Socket, games: IGame[]): number | null {
		games.forEach( (game, index) => {
			if (game.player1.socket == client || game.player2.socket == client) {
				return index;
			}
		});
		return null;
	}

	public findGameByUser(user: User, games: IGame[]): number | null {
		games.forEach( (game, index) => {
			if (game.player1.user.id == user.id || game.player2.user.id == user.id) {
				return index;
			}
		});
		return null;
	}

	public findWaiterByUser(user: User, waiters: Player[]): Player | undefined {
		return waiters.find( waiter => waiter.user == user);
	}

	public disconnectDuringGame(games: IGame[], position: number, client: Socket): IGame[] {
		this.gameService.updateGame({
			gameId: games[position].game.id,
			winnerId: games[position].game.winner_id,
			winnerScore: 0,
			loserScore: 0,
			didInterrupt: true
		}); //put players as online in DB anyway
		games.splice(position);
		if (client == games[position].player1.socket)
			games[position].player2.socket.emit("disconnection");
		else
			games[position].player1.socket.emit('disconnection');
		return games;
	}
}



@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private waiters: Player[];
	private games: IGame[];
	private waitingGames: IGame[];
	private util:	UserGatewayUtil;
	private gameUtil: GameGatewayUtil;

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
		@Inject(MemberService)
		private memberService: MemberService,
		@Inject(BlockService)
		private blockService: BlockService,
		) {
			this.waiters = [];
			this.games = [];
			this.util = new UserGatewayUtil(
				friendshipService, 
				userService, 
				messageService,
				memberService,
				blockService
			);
			this.gameUtil = new GameGatewayUtil(gameService);
		}


	async afterInit(): Promise<any | never> {
		//loop all 10secs
		//check if disconnected
		setInterval(() => {
			this.waiters.sort( (player_1, player_2) => (player_1.user.score - player_2.user.score) );
			let gamesSettings: IGame[] = [];
			for (var i = 0; i < this.waiters.length - 1; i+=2) {
				gamesSettings.push( {player1: this.waiters[i], player2: this.waiters[i+1], game: null} );
			}
			const dto: {id_1: number, id_2: number}[] = gamesSettings.map( settings => { return {id_1: settings.player1.user.id, id_2: settings.player2.user.id}});
			// const games: Game[] = this.gameService.startCompetitiveSet( dto );
			// this.games.push({player1: waiters[i], player2: waiters[i+1], }); //add in list of games once all is done
			//splice from waiters
			//emit to the 2 players

			//method to order the list and match people -> emit to the 2 people that will be in it
		}, 1000);
	}

    async handleConnection(client: Socket, args: any): Promise<any | never> {
		try {
			//manage auth
			const token: string = <string>client.handshake.headers.authorization;
			const user: User = await this.authHelper.getUser(token);
			if ( !args.status || this.gameUtil.findGameByUser(user, this.games) != null || this.gameUtil.findWaiterByUser(user, this.waiters) != undefined)
				throw new Error("Unauthorized");
			if (args.status = 'competitive')
				this.waiters.push({socket: client, user: user});
			else if (args.status = 'friendly')
				{} //add to waiting Games, check if service already check if correct friend accept
			else if (args.status = 'channel')
				{} //exactly same but can be anyone in channel and not only the invited friend

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
		let waiter: Player = this.waiters.find( waiter => waiter.socket == client );
		let pos: number | null = this.gameUtil.findGameByClient(client, this.games);
		if (waiter != undefined)
		{
			await this.userService.outGame(waiter.user.id);
			this.waiters.splice(this.waiters.indexOf(waiter));
		}
		else if (pos != null) {
			this.games = this.gameUtil.disconnectDuringGame(this.games, pos, client);
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

}
