import { configureStore } from '@reduxjs/toolkit';
import messagesSlice from './slices/messages';


export const store = configureStore({
	reducer: {
		messages: messagesSlice.reducer,
	}
});