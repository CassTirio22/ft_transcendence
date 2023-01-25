import { channel } from 'diagnostics_channel';
import { MemberService } from './../message/channel/member/member.service';
import { Member, MemberStatus } from './../message/channel/member/member.entity';
import { MessageService } from './../message/message.service';
import { FriendshipService } from './friendship/friendship.service';
import { UserService } from './user.service';
import { Inject } from "@nestjs/common";
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
import { SocketReadyState } from 'net';

export interface ConnectionMessage {
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

export class UserGatewayUtil {
	constructor(
		@Inject(FriendshipService)
		private friendshipService: FriendshipService,
		@Inject(UserService)
		private userService: UserService,
		@Inject(MessageService)
		private messageService: MessageService,
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
				-(we will need more than  an array of strings for that) OK
			-We will neeed to update channels and clients while status of members/users change
				-first scenario : someone join/leave/is added to a channel
				-second scenario : someone is muted/kicked/banned
				-third scenario : timed mute/kick is over for someone
			-The whole instructions above are there to avoid to check all members+users in each channel

			-Will still need to check who is blocked in the DB
				-indeed always check who blocked the sender to not see the message
				-from there creating a temporary room with all persons that should not receive the message and use except key word before the emit keyword
				-https://github.com/socketio/socket.io/issues/3629

			-When someone block someone else also send through a socket -> just notif, can be hidden in the front until the page is reloaded

		HOW TO STOCK THE CHANNELS? => map(channelId: string, channel: Channel | Direct)
	*/

	public async emitMessage(client: Socket, message: DiscussionMessage): Promise<boolean | never> {
		let channelId: string = this.defineChannelId(message);
		//SOMETHING TO DO
		//won't be enough since have to check if muted -> service memberBySocket and check member.status
		if (!client.rooms.has(channelId)) {
			return false;
		}
		const user: User = await this.userService.userBySocket(client.id);
		//DON'T ADD IN DB ON GATEWAY-SIDE FOR NOW
		// if (message.channel_id)
		// 	await this.messageService.sendChannel({origin: message.channel_id, content: message.content}, user);
		
		//SOMETHING TO DO 
		//except all blockers of user
		//how to check bblock? => get all channel members users block/direct users, block see their status
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

	async userDisconnection(clients: Socket[], user: User, client: Socket): Promise<Socket[]> {
		if (user) {
			const message: ConnectionMessage = {user_id: user.id , status: false};
			this.emitToFriends(clients, client.id, message, this.emitConnection);
		}
		await this.userService.deleteSocket(client.id);
		clients.splice(clients.indexOf(client), 1);
		return clients;
	}

	async getUserChannels(user: User): Promise<Map<string, (Channel | Direct)> | never>
	{
		let channels: Map<string, (Channel | Direct)> = new Map<string, (Channel | Direct)>();
		let discussions: (Channel | Direct)[] = await this.userService.discussions(user);
		discussions.forEach(discussion => {
			let id: {direct_id: number, channel_id: number};
			id.direct_id = ('user1_id' in discussion) ? discussion.id : null;
			id.channel_id = ('name' in discussion) ? discussion.id : null;
			channels.set(this.defineChannelId(id), discussion);
		});
		return channels;
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
	private channels:	Map<string, (Channel | Direct)>;
	private util:		UserGatewayUtil;

	constructor(
		@Inject(AuthHelper)
		private authHelper: AuthHelper,
		@Inject(UserService)
		private userService: UserService,
		@Inject(FriendshipService)
		private friendshipService: FriendshipService,
		@Inject(MessageService)
		private messageService: MessageService,
		@Inject(MemberService)
		private memberService: MemberService,
	) {
		this.clients = [];
		this.channels = new Map<string, (Channel | Direct)>();
		this.util = new UserGatewayUtil(friendshipService, userService, messageService);
	}

	//regular loop
	async afterInit(): Promise<any | never> {
		const users: User[] = await this.userService.ladder();
		setInterval(() => {
			this.clients.forEach((async (client) => {
				if (client.disconnected) {
					this.clients = await this.util.userDisconnection(this.clients, users.find( (obj) => (obj.socket == client.id) ), client);
					//leave every channels joined (should remove each empty room at some point)
					client.rooms.forEach( room => { client.leave(room);} )
				}
			}));
		}, 10000); //every 10 secs
		setInterval(() => {
			//call a member service that would update every members status!!!!
			//update our dear map of channels also maybe(maybe not necessary, we'll see)

			// const members: {socket: string, member: Member}[] = await this.memberService.membersFromSockets(this.clients.map( (socket) => socket.id));
			// members.forEach( (member, index) => {
			// 	const client: Socket = this.clients.find( (client) => {return client.id == member.socket} );
			// 	const channelId = "channel" + member.member.channel_id;
			// 	if (member.member.status == MemberStatus.regular && !client.rooms.has(channelId)) {
			// 		this.joinChannel(client, channelId, this.channels[channelId]);
			// 	}
			// 	else if (member.member.status == MemberStatus.banned && client.rooms.has(channelId)) {
			// 		client.leave(channelId);
			// 	}
			// });
		}, 1000); //every sec
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
			let discussions: Map<string, (Channel | Direct)> = await this.util.getUserChannels(user);
			for (let key of discussions.keys())
				this.joinChannel(client, key, discussions[key]);
		}
		catch (error) {
			client.emit('error', {message: 'Connection unauthorized.'});
			client.disconnect();
		}
	}

	//client disconnect
    async handleDisconnect(client: Socket): Promise<any> {
		const user: User = await this.userService.userBySocket(client.id);
		client.rooms.forEach( room => { client.leave(room)} );
		this.clients = await this.util.userDisconnection(this.clients, user, client);
		const message: ConnectionMessage = {user_id: user.id, status: false};
	}

	//client send message to channel
	@SubscribeMessage("message")
	handleMessage(client: Socket, data: DiscussionMessage) {
		if (!this.util.emitMessage(client, data))
			client.emit('error', {message: 'Sending messages in this channel unauthorized.'});
	}
	
	joinChannel(client: Socket, channelId: string, channelValue: (Direct | Channel)): void {
		if (!this.channels.has(channelId))
			this.channels.set(channelId, channelValue);
		client.join(channelId);
	}
}