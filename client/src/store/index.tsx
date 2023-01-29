import { configureStore } from '@reduxjs/toolkit';
import blockedsSlice from './slices/blocked';
import friendsSlice from './slices/friends';
import messagesSlice from './slices/messages';


export const store = configureStore({
	reducer: {
		messages: messagesSlice.reducer,
		friends: friendsSlice.reducer,
		blocked: blockedsSlice.reducer
	}
});