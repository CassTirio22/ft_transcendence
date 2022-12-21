import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../service/axios"

export const fetchMessages = createAsyncThunk(
	"messages/fetchMessages",
	async (direct_id) => {
		const response = await axios.get(`/message/directMessages/${direct_id}`);
		return response.data;
	}
)

const messagesSlice = createSlice({
	name: "messages",
	initialState: [],
	reducers: {},
	extraReducers: builder => {
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            return action.payload;
        })
      }
})

export const messagesMethods = {
	fetchMessages,
}

export default messagesSlice