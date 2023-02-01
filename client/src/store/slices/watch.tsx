import { createAsyncThunk, createSlice, current, Dispatch } from "@reduxjs/toolkit";
import axios from "../../service/axios"

export const fetchWatch = createAsyncThunk(
	"watch/fetchWatch",
	async () => {
		const response = await axios.get("/game/currents");
		return response.data;
	}
)

type game = {
    id: number,
}

const init_e: game[] = []

const init = {
    watch: init_e,
};

const watchSlice = createSlice({
	name: "watch",
	initialState: init,
	reducers: {},
	extraReducers: builder => {
        builder.addCase(fetchWatch.fulfilled, (state, {payload}) => {
			return {...state, watch: payload};
        })
    }
})

export const watchMethods = {
    fetchWatch,
}

export default watchSlice