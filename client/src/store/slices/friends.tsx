import { createAsyncThunk, createSlice, current, Dispatch } from "@reduxjs/toolkit";
import axios from "../../service/axios"

export const fetchFriends = createAsyncThunk(
	"friends/fetchFriends",
	async () => {
		const response = await axios.get("/friendship/friends");
		return response.data;
	}
)

export const newFriendRequest = createAsyncThunk(
	"friends/newFriendRequest",
	async (id: number) => {
		const response = await axios.post("/friendship/request", {id: id})
		return response.data;
	}
)

export const acceptFriendRequest = createAsyncThunk(
	"friends/acceptFriendRequest",
	async (id: number) => {
		const response = await axios.put("/friendship/response", {applicant: id, didAccept: true});
		return response.data;
	}
)

export const removeFriendRequest = createAsyncThunk(
	"friends/removeFriendRequest",
	async (id: number) => {
		const response = await axios.put("/friendship/response", {applicant: id, didAccept: false});
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
	fetchFriends,
	newFriendRequest,
	acceptFriendRequest,
	removeFriendRequest
}

export default friendsSlice