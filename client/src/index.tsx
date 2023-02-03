import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import reportWebVitals from './reportWebVitals';
import { createCtx } from './contexts/AuthContext';
import { store } from './store';
import { createPopupCtx } from './contexts/PopupContext';
import { createTheme, ThemeProvider } from '@mui/material';
import { createToastCtx } from './contexts/ToastContext';
import Socket from './contexts/Socket';
import { createSocketCtx } from './contexts/SocketContext';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

const [ctx, AuthProvider] = createCtx();
export const AuthContext = ctx;

export const [ctxe, PopupProvider] = createPopupCtx();
export const PopupContext = ctxe;

export const [ctxt, ToastProvider] = createToastCtx();
export const ToastContext = ctxt;

export const [ctxs, SocketProvider] = createSocketCtx();
export const SocketContext = ctxs;

const theme = createTheme({
	palette: {
		mode: "dark",
	},
	components: {
		MuiDrawer: {
		  styleOverrides: {
			paper: {
			  background: "#121212",
			}
		  }
		}
	  }
});

window.console.log = () => {}

root.render(
	<Provider store={store}>
		<AuthProvider>
			<SocketProvider>
				<ThemeProvider theme={theme}>
					<ToastProvider>
						<App/>
					</ToastProvider>
				</ThemeProvider>
			</SocketProvider>
		</AuthProvider>
	</Provider>
);

{/* <React.StrictMode>
	<Provider store={store}>
		<AuthProvider>
			<App/>
		</AuthProvider>
	</Provider>
</React.StrictMode> */}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
