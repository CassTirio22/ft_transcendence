import { FriendshipService } from './friendship/friendship.service';
import { UserService } from './user.service';
import { Inject, Injectable } from "@nestjs/common";
import { 
	OnGatewayConnection, 
	OnGatewayDisconnect, 
	OnGatewayInit, 
	WebSocketGateway,
	WebSocketServer, 
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { AuthHelper } from "./auth/auth.helper";
import { User } from "./user.entity";

interface ConnectionMessage {
	user_id: number;
	status: boolean;
}

interface DiscussionMessage {
	author_id: number;
	date: number;
	direct_id: number;
	channel_id: number;
	content: string;
}

type MessageFormats = ConnectionMessage | DiscussionMessage;
type MessageMethod = (client: Socket, message: MessageFormats) => void;

class UserGatewayUtil {
	constructor(
		@Inject(FriendshipService)
		private friendshipService: FriendshipService,
		@Inject(UserService)
		private userService: UserService,
	) {}


	/* MESSAGES EMITION */

	public emitConnection(client: Socket, message: ConnectionMessage): void {
		client.emit('connection', message);
	}

	public emitMessage(client: Socket, message: DiscussionMessage): void {
		client.emit('message', message);
	}


	/* UTILS */

	emitToSet(clients: Socket[], set: string[], message: MessageFormats, method: MessageMethod) {
		clients.forEach( (client) => {
			if (set.includes(client.id))
				method(client, message);
		});
	}

	async emitToFriends(clients: Socket[], client: string, message: MessageFormats, method: MessageMethod) {
		let set: string[] = (await this.friendshipService.friendsBySocket(client)).map( (obj) => {return obj.socket} );
		this.emitToSet(clients, set, message, method);
	}

	async userDisconnection(clients: Socket[], user: User, client: Socket) {
		if (user) {
			const message: ConnectionMessage = {user_id: user.id , status: false};
			this.emitToFriends(clients, client.id, message, this.emitConnection);
		}
		await this.userService.deleteSocket(client.id);
		clients.splice(clients.indexOf(client), 1);
	}
}



@WebSocketGateway()
export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
	private clients:	Socket[];
	private util:		UserGatewayUtil

	constructor(
		@Inject(AuthHelper)
		private authHelper: AuthHelper,
		@Inject(UserService)
		private userService: UserService,
		@Inject(FriendshipService)
		private friendshipService: FriendshipService,
	) {
		this.clients = [];
		this.util = new UserGatewayUtil(friendshipService, userService);
	}

	async afterInit(): Promise<any | never> {
		const users: User[] = await this.userService.ladder();
		setInterval(() => {
			this.clients.forEach((async (element) => {
				if (element.disconnected) {
					this.util.userDisconnection(this.clients, users.find( (obj) => (obj.socket == element.id) ), element);
				}
			}));
		}, 5000);
	}

    async handleConnection(client: Socket, ...args: any[]): Promise<any | never> {
		try {
			const token: string = <string>client.handshake.headers.authorization;
			const user: User = await this.authHelper.getUser(token); //not ok if wrong token
			await this.userService.saveSocket(user, client.id);
			this.clients.push(client);

			const message: ConnectionMessage = {user_id: user.id, status: true};
			this.util.emitToFriends(this.clients, client.id, message, this.util.emitConnection);
			this.util.emitConnection(client, message);
		}
		catch (error) {
			client.emit('error', {message: 'Connection unauthorized.'});
			client.disconnect();
		}
	}
	
    async handleDisconnect(client: Socket): Promise<any> {
		const user: User = await this.userService.userBySocket(client.id);
		await this.util.userDisconnection(this.clients, user, client);
	}
}