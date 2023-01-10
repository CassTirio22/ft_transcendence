import { channel } from 'diagnostics_channel';
import { FriendshipService } from './friendship/friendship.service';
import { UserService } from './user.service';
import { Inject, Injectable } from "@nestjs/common";
import { 
	OnGatewayConnection, 
	OnGatewayDisconnect, 
	OnGatewayInit, 
	SubscribeMessage, 
	WebSocketGateway,
	WebSocketServer, 
} from "@nestjs/websockets";
import { Socket, Server, ServerOptions } from "socket.io";
import { AuthHelper } from "./auth/auth.helper";
import { User } from "./user.entity";
import { Channel } from '../message/channel/channel.entity';
import { Direct } from '../message/direct/direct.entity';

interface ConnectionMessage {
	user_id: number;
	status: boolean;
}

interface DiscussionMessage {
	author_id: number;
	direct_id: number;
	channel_id: number;
	content: string;
}

type MessageFormats = ConnectionMessage | DiscussionMessage;
type MessageMethod = (client: Socket, message: MessageFormats) => boolean;

class UserGatewayUtil {
	constructor(
		@Inject(FriendshipService)
		private friendshipService: FriendshipService,
		@Inject(UserService)
		private userService: UserService,
	) {}


	/* MESSAGES EMITION */

	public emitConnection(client: Socket, message: ConnectionMessage): boolean {
		client.emit('connection', message);
		return true;
	}

	/*
		BIG DEFINITION OF WHAT WILL HAPPEN NEXT: 
			-No need to check if muted/kick/ban because we can check if inside the channel
			-To be ok with the DB we check at connection which channel client is muted or banned
				-(we will need more than  an array of strings for that)
			-We will neeed to update channels and clients while status of members/users change
				-first scenario : someone join/leave/is added to a channel
				-second scenario : someone is muted/kicked/banned
				-third scenario : timed mute/kick is over for someone
			-The whole instructions above are there to avoid to check all members+users in each channel
			
			-Will still need to check who is blocked in the DB, not very compatible with the channel system
				 -indeed always check who blocked the sender to not see the message
				 -from there creating a temporary room with all persons that should not receive the message and use except key word before the emit keyword

		HOW TO STOCK THE CHANNELS? => map(channelId: string, channel: Channel | Direct)
	*/

	public emitMessage(client: Socket, message: DiscussionMessage): boolean {
		let channelId: string = this.defineChannelId(message);
		//SOMETHING TO DO
		//just check if client in channel, will have to check about mute/ban, blocked
		//how to check that? => get all channel members users block/direct users, block see their status
		if (!client.rooms.has(channelId)) { //won't be enough since have to check if muted/kicked/blocked
			return false;
		}
		client.to(channelId).emit('message', message);
		return true;
	}

	/* UTILS */

	emitToSet(clients: Socket[], set: string[], message: MessageFormats, method: MessageMethod): void {
		clients.forEach( (client) => {
			if (set.includes(client.id))
				method(client, message);
		});
	}

	async emitToFriends(clients: Socket[], client: string, message: MessageFormats, method: MessageMethod) {
		let set: string[] = (await this.friendshipService.friendsBySocket(client)).map( (obj) => {return obj.socket} );
		this.emitToSet(clients, set, message, method);
	}

	async userDisconnection(clients: Socket[], user: User, client: Socket): Promise<void> {
		//send to friends about disconnection
		if (user) {
			const message: ConnectionMessage = {user_id: user.id , status: false};
			this.emitToFriends(clients, client.id, message, this.emitConnection);
		}

		//delete socket and remove it from socket list
		await this.userService.deleteSocket(client.id);
		clients.splice(clients.indexOf(client), 1);
	}

	async getUserChannels(user: User): Promise<string[] | never>
	{
		let channelIds: string[] = [];
		let discussions: (Channel | Direct)[] = await this.userService.discussions(user);
		//SOMETHING TO DO : CHECK IF BANNED/KICKED FROM CHANNEL (WILL BE ACCESSIBLE LATER)
		discussions.forEach(discussion => {
			let id: {direct_id: number, channel_id: number};
			id.direct_id = ('user1_id' in discussion) ? discussion.id : null;
			id.channel_id = ('name' in discussion) ? discussion.id : null;
			channelIds.push(this.defineChannelId(id));
		});
		return channelIds;
	}

	defineChannelId(settings : {direct_id: number, channel_id: number}): string | null {
		if ((settings.direct_id == null && settings.channel_id == null)
		|| (settings.direct_id != null && settings.channel_id != null)) {
			return null;
		}
		else if (settings.direct_id != null) {
			return ("direct" + settings.direct_id);
		}
		return ("channel" + settings.channel_id);
	}
}


@WebSocketGateway()
export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
	@WebSocketServer()
	server: Server;

	private clients:	Socket[];
	private channels:	string[];
	private directs:	string[];
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
		this.channels = [];
		this.directs = [];
		this.util = new UserGatewayUtil(friendshipService, userService);
	}

	//regular loop
	async afterInit(): Promise<any | never> {
		const users: User[] = await this.userService.ladder();
		setInterval(() => {
			this.clients.forEach((async (client) => {
				if (client.disconnected) {
					this.util.userDisconnection(this.clients, users.find( (obj) => (obj.socket == client.id) ), client);
					//leave every channels joined (should remove each empty room at some point)
					client.rooms.forEach( room => { client.leave(room);} )
				}
			}));
		}, 10000); //every 10 secs
		//SOMETHING TO DO
		//CHECK ABOUT MUTED / BANNED HAS ENDED
	}

	//client connect
    async handleConnection(client: Socket, ...args: any[]): Promise<any | never> {
		try {
			//manage auth
			const token: string = <string>client.handshake.headers.authorization;
			const user: User = await this.authHelper.getUser(token); //not ok if wrong token
			await this.userService.saveSocket(user, client.id);
			this.clients.push(client);

			//emit connection to friends
			const message: ConnectionMessage = {user_id: user.id, status: true};
			this.util.emitToFriends(this.clients, client.id, message, this.util.emitConnection);
			this.util.emitConnection(client, message);

			//create and join all channels/directs
			let discussions: string[] = await this.util.getUserChannels(user);
			discussions.forEach( discussion => this.joinChannel(client, discussion));
		}
		catch (error) {
			client.emit('error', {message: 'Connection unauthorized.'});
			client.disconnect();
		}
	}

	//client disconnect
    async handleDisconnect(client: Socket): Promise<any> {
		const user: User = await this.userService.userBySocket(client.id);
		await this.util.userDisconnection(this.clients, user, client);
		//leave every channels joined (should remove each empty room at some point)
		client.rooms.forEach( room => { client.leave(room);} )
	}

	//client send message to channel
	@SubscribeMessage("message")
	handleMessage(client: Socket, data: DiscussionMessage)
	{
		//check if client has the right to send to channel
		if (!this.util.emitMessage(client, data))
			client.emit('error', {message: 'Sending messages in this channel unauthorized.'});
	}

	//ACTIONS TO DO ;
	// JOIN/LEAVE CHANNEL
	// ADD USER TO CHANNEL
	// BLOCK USER
	// MUTE/KICK FROM CHANNEL (ALSO CHANGE TIMING)
	// 

	// @SubscribeMessage("join")
	// handleJoin(client: Socket, data)

	joinChannel(client: Socket, channelId: string): void {
		if (!this.channels.includes(channelId))
			this.channels.push(channelId);
		client.join(channelId);
	}
}