import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../service/axios"

export const fetchMessages = createAsyncThunk(
	"messages/fetchMessages",
	async (events) => {
		const response = await axios.get("/");
		return response;
	}
)

const messagesSlice = createSlice({
	name: "messages",
	initialState: [],
	reducers: {},
	extraReducers: builder => {
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            return [];
        })
      }
})

export const messagesMethods = {
	fetchMessages,
}

export default messagesSlice