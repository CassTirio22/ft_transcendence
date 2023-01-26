import axios from 'axios';
import { base_url } from '../constants/constants';

export const baseURL =  base_url;

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