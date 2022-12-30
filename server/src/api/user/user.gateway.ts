import { UserService } from './user.service';
import { Inject, HttpException, HttpStatus } from "@nestjs/common";
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

@WebSocketGateway()
export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
	private clients: Socket[];

	constructor(
		@Inject(AuthHelper)
		private authHelper: AuthHelper,
		@Inject(UserService)
		private userService: UserService,
	) {
		this.clients = [];
	}

	async afterInit(): Promise<any | never> {
		const users: User[] = await this.userService.ladder();
		setInterval(() => {
			this.clients.forEach( (async (element) => {
				if (element.disconnected) {
					await this.userService.deleteSocket(element.id);
					this.clients.splice(this.clients.indexOf(element), 1);
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
			client.emit('connection', {message: 'Connected to MegaMegaPong server.'});
		}
		catch (error) {
			client.emit('error', {message: 'Connection unauthorized.'});
			client.disconnect();
		}
	}
	
    async handleDisconnect(client: Socket): Promise<any> {
		await this.userService.deleteSocket(client.id);
		this.clients.splice(this.clients.indexOf(client), 1);
	}
}