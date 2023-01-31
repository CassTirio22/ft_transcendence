import { createAsyncThunk, createSlice, current, Dispatch } from "@reduxjs/toolkit";
import axios from "../../service/axios"

export const fetchCurrentGame = createAsyncThunk(
	"games/fetchCurrentGame",
	async () => {
		const response = await axios.get("/game/current");
		return response.data;
	}
)

export const gameMaking = createAsyncThunk(
	"games/gameMaking",
	async () => {
		const response = await axios.post("/game/matchmaking");
		return response.data;
	}
)

type game = {
    id: number,
}

const init: game | null = null;

const gamesSlice = createSlice({
	name: "games",
	initialState: init,
	reducers: {},
	extraReducers: builder => {
        builder.addCase(gameMaking.fulfilled, (state, {payload}) => {
			return payload;
        })
        builder.addCase(fetchCurrentGame.fulfilled, (state, {payload}) => {
			return payload;
        })
        builder.addCase(gameMaking.rejected, (state, action) => {
			console.log(action)
        })
    }
})

export const gamesMethods = {
    gameMaking,
    fetchCurrentGame
}

export default gamesSlice