import { 
	OnGatewayConnection, 
	OnGatewayDisconnect, 
	OnGatewayInit, 
	SubscribeMessage, 
	WebSocketGateway,
	WebSocketServer, 
} from "@nestjs/websockets";
import { Socket } from "socket.io";


//ball position will always be calculated server-side
interface PongMessage {
	pos_1: number;
	pos_2: number;
}

class Pong {
	constructor() {}


}


@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
	private waiters: Socket[];
	private players: {player1: Socket, player2: Socket}[];

	constructor() {}

	async afterInit(): Promise<any | never> {
		//loop all 10secs
		//check if disconnected
		//loop all secs
		//method to order the list and match people
	}

    async handleConnection(client: Socket, ...args: any[]): Promise<any | never> {
		//check auth
		//check if already in game
		//add in line
	}

    async handleDisconnect(client: Socket): Promise<any> {
		//out of game, the rest is DB problem
		//notify the other if they had a room
	}

	@SubscribeMessage("friendly")
	async handleFriendlyGame(client: Socket, data: number) {
		//try catch the DB method to see if possible
		//add them in 'players' array
		//start game mate
	}
}
