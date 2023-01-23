import { createAsyncThunk, createSlice, current, Dispatch } from "@reduxjs/toolkit";
import { useParams } from "react-router-dom";
import axios from "../../service/axios"


type Channel = {
	id: number,
	messages: any,
	title: string,
	members: any
}

const test: Channel[] = []

type fetch_params = {
	user: any,
	friends: any,
	channel_id: number,
	direct_id: number
}

export type NewMessage = {
	origin: number,
	content: String,
}

export const fetchMessages = createAsyncThunk(
	"messages/fetchMessages",
	async (params: fetch_params) => {
		const response = await axios.get("/user/discussions");
		return {data: response.data, user: params.user, friends: params.friends, channel_id: params.channel_id, direct_id: params.direct_id};
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
		return response.data;
	}
)

export const sendChannel = createAsyncThunk(
	"messages/sendChannel",
	async (new_message: NewMessage) => {
		const response = await axios.post("/message/sendChannel", new_message);
		return response.data;
	}
)


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
	},
	extraReducers: builder => {
        builder.addCase(fetchMessages.fulfilled, (state, {payload}) => {
			const {data, user, friends, channel_id, direct_id} = payload;
			const user_id = payload.user?.id;
			let cha: Channel[] = [];
			let direct: Channel[] = [];
			for (let index = 0; index < data.length; index++) {
				const conv = data[index];
				if (conv.user1_id) {
					const id_other = conv.user1_id == user_id ? conv.user2_id : conv.user1_id;
					const fr = friends.filter((elem: Channel) => elem.id == id_other)[0];
					const direct_elem = {
						id: conv.id,
						messages: conv.messages,
						title: fr.name,
						members: [
							{
								id: user_id,
								full_name: user.name,
								image_path: user.name
							},
							{
								id: user_id,
								full_name: fr.name,
								image_path: fr.name
							},
						]
					}
					direct.push(direct_elem);
				} else {
					const direct_elem = {
						id: conv.id,
						messages: conv.messages,
						title: conv.name,
						members: []
					}
					cha.push(direct_elem)
				}
			}
            state.current = {
				is_channel: false,
				id: -1,
			}
			state.channels = cha;
			state.direct = direct;
			if (channel_id && cha.filter(elem => elem.id == channel_id).length != 0) {
				state.current = {
					is_channel: true,
					id: channel_id,
				}
			} else if (direct_id && direct.filter(elem => elem.id == direct_id).length != 0) {
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
					full_name: user.user.name,
					image_path: user.user.name
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
      }
})

export const selectConversation = (type: any) => (dispatch: any) => {
	dispatch(messagesSlice.actions.selectConversation(type));
}

export const messagesMethods = {
	fetchMessages,
	selectConversation,
	fetchSpecificChannel,
	fetchSpecificDirect,
	sendDirect,
	sendChannel
}

export default messagesSlice