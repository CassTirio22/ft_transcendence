import { createAsyncThunk, createSlice, current, Dispatch } from "@reduxjs/toolkit";
import axios from "../../service/axios"

export const fetchBlockeds = createAsyncThunk(
	"blockeds/fetchBlockeds",
	async () => {
		const response = await axios.get("/block/blocked");
		return response.data;
	}
)

export const blockUser = createAsyncThunk(
	"blockeds/blockUser",
	async (id: number) => {
		const response = await axios.post("/block/block", {id: id});
		return response.data;
	}
)

export const unBlockUser = createAsyncThunk(
	"blockeds/unBlockUser",
	async (id: number) => {
		const response = await axios.delete("/block/delete/" + id.toString());
		return response.data;
	}
)

type blocked = {
    id: number,
}

const init: blocked[] = []

const blockedsSlice = createSlice({
	name: "blockeds",
	initialState: init,
	reducers: {},
	extraReducers: builder => {
        builder.addCase(fetchBlockeds.fulfilled, (state, {payload}) => {
			return payload
        })
      }
})

export const blockedsMethods = {
	fetchBlockeds,
    blockUser,
    unBlockUser
}

export default blockedsSlice