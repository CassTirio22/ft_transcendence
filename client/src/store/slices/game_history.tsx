import { createAsyncThunk, createSlice, current, Dispatch } from "@reduxjs/toolkit";
import axios from "../../service/axios"

export const fetchGameHistory = createAsyncThunk(
	"game_history/fetchGameHistory",
	async () => {
		const response = await axios.get("/game/all");
		return response.data;
	}
)

type game = {
    id: number,
}

const init_e: game[] = []

const init = {
    done: init_e,
    pending: init_e,
    ongoing: init_e,
};

const gameHistorySlice = createSlice({
	name: "game_history",
	initialState: init,
	reducers: {},
	extraReducers: builder => {
        builder.addCase(fetchGameHistory.fulfilled, (state, {payload}) => {
            console.log(payload)
			return payload;
        })
    }
})

export const gameHistoryMethods = {
    fetchGameHistory,
}

export default gameHistorySlice