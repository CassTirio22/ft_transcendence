import { createAsyncThunk, createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "../../service/axios"

const channels = [
	{
		id: 1,
		title: "First channel",
		last_message: {
			content: "Hey how are you all?",
			created_at: new Date().toJSON(),
		},
		messages: [
			{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			}
		],
		members: [
			{
				id: 1,
				full_name: "Bob Marley",
				image_path: "aebrvdvqe",
			},
			{
				id: 2,
				full_name: "Jean Vient",
				image_path: "abeqgrsdvf",
			},
		]
	},
	{
		id: 2,
		title: "Hehe brooo",
		last_message: {
			content: "Tromadaire?",
			created_at: new Date().toJSON(),
		},
		messages: [
			{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			}
		],
		members: [
			{
				id: 1,
				full_name: "Albert Marley",
				image_path: "hegrh",
			},
			{
				id: 2,
				full_name: "Jeanne Vient",
				image_path: "gegvafawe",
			},
		]
	},
	{
		id: 3,
		title: "Trololol une autre wesh",
		last_message: {
			content: "Just another one!",
			created_at: new Date().toJSON(),
		},
		messages: [
			{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 3,
				created_at: new Date().toJSON()
			}
		],
		members: [
			{
				id: 1,
				full_name: "Bob Test",
				image_path: "badsfeaww",
			},
			{
				id: 2,
				full_name: "Jean Vient",
				image_path: "hwegj",
			},
			{
				id: 3,
				full_name: "tpetit",
				image_path: "sdfjoqwifjos",
			},
		]
	}
]

const direct = [
	{
		id: 1,
		title: "Jason d'Ublet",
		last_message: {
			content: "Tu viens quand?",
			created_at: new Date().toJSON(),
		},
		messages: [
			{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			}
		],
		members: [
			{
				id: 1,
				full_name: "Jason d'Ublet",
				image_path: "qwfaosjdf",
			},{
				id: 2,
				full_name: "tpetit",
				image_path: "sdfjoqwifjos",
			},
		]
	},{
		id: 2,
		title: "Laura Murelle",
		last_message: {
			content: "Comment vas tu?",
			created_at: new Date().toJSON(),
		},
		messages: [
			{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 2,
				created_at: new Date().toJSON()
			},{
				content: "Hey how are you all?",
				sender: 1,
				created_at: new Date().toJSON()
			}
		],
		members: [
			{
				id: 1,
				full_name: "Laura Murelle",
				image_path: "wfojs",
			},
			{
				id: 2,
				full_name: "tpetit",
				image_path: "sdfjoqwifjos",
			},
		]
	},
]

export const fetchMessages = createAsyncThunk(
	"messages/fetchMessages",
	async (events) => {
		const response = await axios.get("/");
		return response;
	}
)

const messagesSlice = createSlice({
	name: "messages",
	initialState: {
		channels: [...channels],
		direct: [...direct],
		current: {
			is_channel: false,
			id: 1,
		}
	},
	reducers: {
		selectConversation: (state, action) => {
			state.current = action.payload;
        },
	},
	extraReducers: builder => {
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            return state;
        })
      }
})

export const selectConversation = (type: any) => (dispatch: any) => {
	dispatch(messagesSlice.actions.selectConversation(type));
}

export const messagesMethods = {
	fetchMessages,
	selectConversation
}

export default messagesSlice