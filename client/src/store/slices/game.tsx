import { createAsyncThunk, createSlice, current, Dispatch } from "@reduxjs/toolkit";
import axios from "../../service/axios"

export const fetchCurrentGame = createAsyncThunk(
	"games/fetchCurrentGame",
	async () => {
		const response = await axios.get(`/game/current`);
		return response.data;
	}
)

export const fetchSelectedGame = createAsyncThunk(
	"games/fetchSelectedGame",
	async (address: string) => {
		const response = await axios.get(`/game/${address}`);
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
	reducers: {
		clearGame: (state, action) => {
			return init;
        },
	},
	extraReducers: builder => {
        builder.addCase(gameMaking.fulfilled, (state, {payload}) => {
			return payload;
        })
        builder.addCase(fetchCurrentGame.fulfilled, (state, {payload}) => {
			if (payload == "")
				return state;
			return payload;
        })
		builder.addCase(fetchSelectedGame.fulfilled, (state, {payload}) => {
			if (payload == "")
				return state;
			return payload;
        })
        builder.addCase(gameMaking.rejected, (state, action) => {})
    }
})

export const clearGame = (type: any) => (dispatch: any) => {
	dispatch(gamesSlice.actions.clearGame(type));
}


export const gamesMethods = {
    gameMaking,
    fetchCurrentGame,
	fetchSelectedGame,
	clearGame
}

export default gamesSlice