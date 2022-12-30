import { UserService } from './user.service';
import { Inject, HttpException, HttpStatus } from "@nestjs/common";
import { 
	ConnectedSocket,
	MessageBody, 
	OnGatewayConnection, 
	OnGatewayDisconnect, 
	OnGatewayInit, 
	SubscribeMessage, 
	WebSocketGateway, 
	WebSocketServer 
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { AuthHelper } from "./auth/auth.helper";
import { User } from "./user.entity";

@WebSocketGateway()
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect{
	constructor(
		@Inject(AuthHelper)
		private authHelper: AuthHelper,
		@Inject(UserService)
		private userService: UserService,
	) {}
	
    async handleConnection(client: Socket, ...args: any[]): Promise<any | never> {
		try {
			const token: string = <string>client.handshake.headers.authorization;
			console.log(`token : ${token}`);
			const user: User = await this.authHelper.getUser(token); //not ok if wrong token
			await this.userService.saveSocket(user, client.id);
			client.emit('connection', {message: 'Connected to MegaMegaPong server.'});
		}
		catch (error) {
			console.log(error);
			client.emit('error', {message: 'Connection unauthorized.'});
			client.disconnect();
		}
	}
	
    async handleDisconnect(client: Socket): Promise<any> {
		await this.userService.deleteSocket(client.id);
		client.emit('connection', {message: "Disconnected form MegaMegaPong server."});
	}
}