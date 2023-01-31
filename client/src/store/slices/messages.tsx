import { createAsyncThunk, createSlice, current, Dispatch } from "@reduxjs/toolkit";
import { useParams } from "react-router-dom";
import axios from "../../service/axios"


export type Channel = {
	id: number,
	messages: any,
	title: string,
	members: any
}

const test: Channel[] = []

type fetch_params = {
	user: any,
	channel_id: number,
	direct_id: number
}

type CreateChannel = {
	status: String,
	password?: String,
	name: String
}

type JoinChannel = {
	channel: number,
	password?: String
}

type AddMember = {
	channel: number,
	member: number
}

export type NewMessage = {
	origin: number,
	content: String,
}

export const fetchMessages = createAsyncThunk(
	"messages/fetchMessages",
	async (params: fetch_params) => {
		const response = await axios.get("/user/discussions");
		return {data: response.data, user: params.user, channel_id: params.channel_id, direct_id: params.direct_id};
	}
)

export const fetchSpecificChannel = createAsyncThunk(
	"messages/fetchSpecificChannel",
	async (id: string) => {
		const response = await axios.get("/message/channelMessages/" + id);
		const members = await axios.get("/member/members/" + id);
		return {id: id, messages: response.data, members: members.data};
	}
)

export const fetchSpecificDirect = createAsyncThunk(
	"messages/fetchSpecificDirect",
	async (id: string) => {
		const response = await axios.get("/message/directMessages/" + id);
		return {id: id, messages: response.data};
	}
)

export const sendDirect = createAsyncThunk(
	"messages/sendDirect",
	async (new_message: NewMessage) => {
		const response = await axios.post("/message/sendDirect", new_message);
		return "3";
	}
)

export const sendChannel = createAsyncThunk(
	"messages/sendChannel",
	async (new_message: NewMessage) => {
		const response = await axios.post("/message/sendChannel", new_message);
		return response.data;
	}
)

export const createDirect = createAsyncThunk(
	"messages/createDirect",
	async (user_id: number) => {
		const response = await axios.post("/direct/create", {id: user_id});
		return response.data.id;
	}
)

export const createChannel = createAsyncThunk(
	"messages/createChannel",
	async (new_channel: CreateChannel) => {
		const response = await axios.post("/channel/create", new_channel);
		return response.data.id;
	}
)

export const joinChannel = createAsyncThunk(
	"messages/joinChannel",
	async (join_channel: JoinChannel) => {
		const response = await axios.post("/member/become", join_channel);
		return response.data.id;
	}
)

export const addMember = createAsyncThunk(
	"messages/addMember",
	async (add_member: AddMember) => {
		const response = await axios.post("/member/add", add_member);
		return response.data.id;
	}
)

function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

const messagesSlice = createSlice({
	name: "messages",
	initialState: {
		channels: test,
		direct: test,
		current: {
			is_channel: false,
			id: -1,
		}
	},
	reducers: {
		selectConversation: (state, action) => {
			state.current = action.payload;
        },
		addMessage: (state, action) => {
			const message = action.payload;
			if (message.direct_id) {
				const ind = state.direct.filter((e: any) => e.id == message.direct_id);
				if (ind.length) {
					const value = ind[0];
					value.messages.push({
						id: makeid(16),
						author_id: message.author_id,
						date: new Date().toJSON(),
						content: message.content
					})
				}
			} else {
				const ind = state.channels.filter((e: any) => e.id == message.channel_id);
				if (ind.length) {
					const value = ind[0];
					value.messages.push({
						id: makeid(16),
						author_id: message.author_id,
						date: new Date().toJSON(),
						content: message.content
					})
				}
			}
		}
	},
	extraReducers: builder => {
        builder.addCase(fetchMessages.fulfilled, (state, {payload}) => {
			const {data, user, channel_id, direct_id} = payload;
			const user_id = payload.user?.id;
			let cha: Channel[] = [];
			let direct: Channel[] = [];
			for (let index = 0; index < data.length; index++) {
				const conv = data[index];
				
				if (conv.user1_id != undefined) {
					const direct_elem = {
						id: conv.id,
						messages: conv.messages,
						title: user_id == conv.user1_id ? conv.user2.name : conv.user1.name,
						members: [
							{
								id: conv.user1.id,
								picture: conv.user1.picture,
								name: conv.user1.name
							},
							{
								id: conv.user2.id,
								picture: conv.user2.picture,
								name: conv.user2.name
							},
						]
					}
					direct.push(direct_elem);
				} else {
					const direct_elem = {
						id: conv.id,
						messages: conv.messages,
						title: conv.name,
						status: conv.status,
						members: []
					}
					direct_elem.members = conv.members.map((user: any) => {
						return {
							id: user.user_id,
							picture: user.user.picture,
							name: user.user.name,
							level: user.level,
							status: user.status
						}
					})
					cha.push(direct_elem)
				}
			}
            state.current = {
				is_channel: false,
				id: -1,
			}
			state.channels = cha;
			state.direct = direct;
			if (channel_id) {
				state.current = {
					is_channel: true,
					id: channel_id,
				}
			} else if (direct_id) {
				state.current = {
					is_channel: false,
					id: direct_id,
				}
			} else if (!channel_id && !direct_id) {
				if (cha.length) {
					state.current = {
						is_channel: true,
						id: cha[0].id,
					}
				} else if (direct.length) {
					state.current = {
						is_channel: false,
						id: direct[0].id,
					}
				}
			}
        })
		builder.addCase(fetchSpecificChannel.fulfilled, (state, {payload}) => {
			const chan = [...state.channels];
			const old = state.channels.filter(e => e.id.toString() == payload.id);
			if (!old.length) {
				return state;
			}
			const members = payload.members.map((user: any) => {
				return {
					id: user.user_id,
					picture: user.user.picture,
					name: user.user.name,
					level: user.level,
					status: user.status
				}
			})
			state.channels.splice(state.channels.indexOf(old[0]), 1, {...state.channels[state.channels.indexOf(old[0])], messages: payload.messages, members: members})
		})

		builder.addCase(fetchSpecificDirect.fulfilled, (state, {payload}) => {
			const chan = [...state.direct];
			const old = state.direct.filter(e => e.id.toString() == payload.id);
			if (!old.length) {
				return state;
			}
			state.direct.splice(state.direct.indexOf(old[0]), 1, {...state.direct[state.direct.indexOf(old[0])], messages: payload.messages})
		})

		builder.addCase(sendChannel.fulfilled , (state, {payload}) => {})

		builder.addCase(sendChannel.rejected , (state, action) => {
			console.log(action.error.code)
		})

		builder.addCase(sendDirect.fulfilled , (state, {payload}) => {})

		builder.addCase(sendDirect.rejected , (state, action) => {
			
		})
      }
})

export const selectConversation = (type: any) => (dispatch: any) => {
	dispatch(messagesSlice.actions.selectConversation(type));
}

export const addMessage = (type: any) => (dispatch: any) => {
	dispatch(messagesSlice.actions.addMessage(type));
}

export const messagesMethods = {
	fetchMessages,
	selectConversation,
	fetchSpecificChannel,
	fetchSpecificDirect,
	sendDirect,
	sendChannel,
	createDirect,
	createChannel,
	addMessage,
	joinChannel,
	addMember
}

export default messagesSlice