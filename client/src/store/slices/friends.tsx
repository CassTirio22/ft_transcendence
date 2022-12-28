import { createAsyncThunk, createSlice, current, Dispatch } from "@reduxjs/toolkit";
import axios from "../../service/axios"

export const fetchFriends = createAsyncThunk(
	"friends/fetchFriends",
	async () => {
		const response = await axios.get("/friendship/friends");
		return response.data;
	}
)

type friend = {
    id: number,
    full_name: string,
    image_path: string
}

const test: friend[] = []

const friendsSlice = createSlice({
	name: "friends",
	initialState: test,
	reducers: {},
	extraReducers: builder => {
        builder.addCase(fetchFriends.fulfilled, (state, {payload}) => {
			return payload
        })
      }
})

export const friendsMethods = {
	fetchFriends
}

export default friendsSlice