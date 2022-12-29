import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "ws";

@WebSocketGateway()
export class UserGateway {
	@WebSocketServer() server: Server;

	// constructor() {
	// 	this.server();
	// 	this.server.on('disconnects', client => {
	// 		console.log(`Client disconnected: ${client.id}`);
	// 	});
	// }

	@SubscribeMessage('connected')
	handleEvent(@MessageBody() data: string): string {
	  return "I received " + data;
	}
}