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
    image_path: string,
	status: number
}

const test: friend[] = []

const friendsSlice = createSlice({
	name: "friends",
	initialState: test,
	reducers: {
		changeFriendStatus: (state, action) => {
			const last = state.filter((e: any) => e.id == action.payload.user_id);
			if (last.length) {
				if (action.payload.game && action.payload.status) {
					last[0].status = 2
				} else if (!action.payload.game) {
					last[0].status = !action.payload.status ? 1 : 0;
				} else {
					last[0].status = 0;
				}
			}
        },
	},
	extraReducers: builder => {
        builder.addCase(fetchFriends.fulfilled, (state, {payload}) => {
			return payload
        })
      }
})

export const changeFriendStatus = (type: any) => (dispatch: any) => {
	dispatch(friendsSlice.actions.changeFriendStatus(type));
}

export const friendsMethods = {
	fetchFriends,
	newFriendRequest,
	acceptFriendRequest,
	removeFriendRequest,
	changeFriendStatus
}

export default friendsSlice