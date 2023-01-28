import { BlockService } from './block/block.service';
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
import { Socket, Server } from "socket.io";
import { AuthHelper } from "./auth/auth.helper";
import { User } from "./user.entity";
import { Channel } from '../message/channel/channel.entity';
import { Direct } from '../message/direct/direct.entity';

export interface ConnectionMessage {
	user_id: number;
	status: boolean;
}

interface DiscussionMessage {
	direct_id: number;
	channel_id: number;
	content: string;
}

interface GameMessage {
	user_id: number;
	status: boolean;
}

type MessageFormats = ConnectionMessage | DiscussionMessage | GameMessage;
type MessageMethod = (client: Socket, message: MessageFormats) => boolean;

export class UserGatewayUtil {
	constructor(
		@Inject(FriendshipService)
		private friendshipService: FriendshipService,
		@Inject(UserService)
		private userService: UserService,
		@Inject(MessageService)
		private messageService: MessageService,
		@Inject(MemberService)
		private memberService: MemberService,
		@Inject(BlockService)
		private blockService: BlockService,
	) {}

	/* MESSAGES EMITION */

	public emitConnection(client: Socket, message: ConnectionMessage): boolean {
		client.emit('connection', message);
		return true;
	}

	public emitGame(client: Socket, message: ConnectionMessage): boolean {
		client.emit('game', message);
		return true;
	}

	public async emitMessage(client: Socket, message: DiscussionMessage, clients: Socket[]): Promise<boolean | never> {
		let channelId: string = this.defineChannelId(message);
		let member: Member = await this.memberService.memberBySocket(client.id, message.channel_id);
		let user: User = await this.userService.userBySocket(client.id);
		if (!client.rooms.has(channelId) || (member != null &&  member.status == MemberStatus.muted) ) {
			return false;
		}
		//DON'T ADD IN DB ON GATEWAY-SIDE FOR NOW
		// if (message.channel_id)
		// 	await this.messageService.sendChannel({origin: message.channel_id, content: message.content}, user);
		
		const blockers: User[] = await this.blockService.getBlockerList(user);
		const blockerSockets: Socket[] = [];
		clients.forEach( client => {
			if (blockers.find( blocker => blocker.socket == client.id) != undefined) {
				blockerSockets.push(client);
			}
		});
		blockerSockets.forEach( blocker => {blocker.join('blockRoom'); });

		client.to(channelId).except('blockRoom').emit('messages', message);
		client.emit('messages', message);

		blockerSockets.forEach( blocker => blocker.leave('blockRoom'));

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
			let id: {direct_id: number, channel_id: number} = {direct_id: null, channel_id: null};
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


@WebSocketGateway({cors: true})
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
		@Inject(BlockService)
		private blockService: BlockService,
	) {
		this.clients = [];
		this.channels = new Map<string, (Channel | Direct)>();
		this.util = new UserGatewayUtil(
			friendshipService, 
			userService, 
			messageService, 
			memberService, 
			blockService
		);
	}

	//regular loop
	async afterInit(): Promise<any | never> {
		const users: User[] = await this.userService.ladder();
		setInterval(async () => {
			//managing disconnection part
			this.clients.forEach((async (client) => {
				if (client.disconnected) {
					this.clients = await this.util.userDisconnection(this.clients, users.find( (obj) => (obj.socket == client.id) ), client);
					client.rooms.forEach( room => { client.leave(room);} )
				}
			}));

			//managing evolution of member status over time
			await this.memberService.updateStatus();
			const members: {socket: string, member: Member}[] = await this.memberService.membersFromSockets(this.clients.map( (socket) => socket.id));
			members.forEach( (member) => {
				const client: Socket = this.clients.find( (client) => {return client.id == member.socket} );
				if (client != undefined) {
					const channelId = "channel" + member.member.channel_id;
					if (member.member.status == MemberStatus.regular && !client.rooms.has(channelId)) {
						this.joinChannel(client, channelId, this.channels[channelId]);
					}
					else if (member.member.status == MemberStatus.banned && client.rooms.has(channelId)) {
						client.leave(channelId);
					}
				}
			});
		}, 1000); //every 1 sec
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
		if (!user)
			return ;
		this.clients = await this.util.userDisconnection(this.clients, user, client);
		const message: ConnectionMessage = {user_id: user.id, status: false};
	}

	//client send message to channel
	@SubscribeMessage("message")
	handleMessage(client: Socket, data: DiscussionMessage) {
		if (!this.util.emitMessage(client, data, this.clients))
			client.emit('error', {message: 'Sending messages in this channel unauthorized.'});
	}

	@SubscribeMessage("game")
	async handleGame(client: Socket, data: { isPlaying: boolean} ) {
		const user: User = await this.userService.userBySocket(client.id);
		const val: boolean = data.isPlaying;
		let message: GameMessage = { user_id: user.id, status: val };
		let ret: number = (val == true) ? (await this.userService.socketInGame(client.id)) : (await this.userService.socketOutGame(client.id));
		if (ret) {
			client.emit("game", message);
			this.util.emitToFriends(this.clients, client.id, message, this.util.emitGame);
		}
		else {
			client.emit("error", {message: "Couldn't change your status."});
		}
	}
	
	joinChannel(client: Socket, channelId: string, channelValue: (Direct | Channel)): void {
		if (!this.channels.has(channelId))
			this.channels.set(channelId, channelValue);
		client.join(channelId);
	}
}