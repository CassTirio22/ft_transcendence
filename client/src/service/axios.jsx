import axios from 'axios';

export const baseURL =  "http://localhost:5000";

const instance = axios.create({
	baseURL: `${baseURL}/`,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
	timeout: 2000,
});

export const set_instance_token = (token) => {
	instance.defaults.headers.authorization = `Bearer ${token}`;
}

export const unset_instance_token = () => {
	instance.defaults.headers.authorization = "";
}

export default instance;