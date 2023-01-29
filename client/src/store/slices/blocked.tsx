import { createAsyncThunk, createSlice, current, Dispatch } from "@reduxjs/toolkit";
import axios from "../../service/axios"

export const fetchBlockeds = createAsyncThunk(
	"blockeds/fetchBlockeds",
	async () => {
		const response = await axios.get("/block/blocked");
		return response.data;
	}
)

type blocked = {
    id: number,
}

const blockedsSlice = createSlice({
	name: "blockeds",
	initialState: [],
	reducers: {},
	extraReducers: builder => {
        builder.addCase(fetchBlockeds.fulfilled, (state, {payload}) => {
            console.log(payload)
			return payload
        })
      }
})

export const blockedsMethods = {
	fetchBlockeds
}

export default blockedsSlice