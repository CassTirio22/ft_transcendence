import React, { Dispatch, PropsWithChildren, SetStateAction, useEffect }  from 'react'
import { createContext, useState } from 'react';
import { isCompositeComponent } from 'react-dom/test-utils';
import { base_url } from '../constants/constants';
import axios, { set_instance_token, unset_instance_token } from "../service/axios"

const reset_user = {
	id: 0,
	name: "Pseudo",
	first_name: "Anonymous",
	last_name: "User",
	email: "email",
	token: "",
	score: 0,
	custom: "",
	coins: 0,
	picture: "https://avatars.dicebear.com/api/avataaars/your-custom-seed.png",
	store: {
		balls: [""],
		pads: [""],
		selected_ball: "",
		selected_pad: "",
	}
}

export function createCtx() {
	const default_user = {
		id: 0,
		name: "Pseudo",
		first_name: "Anonymous",
		last_name: "User",
		email: "email",
		token: "",
		score: 0,
		custom: "",
		coins: 0,
		picture: "https://avatars.dicebear.com/api/avataaars/your-custom-seed.png",
		store: {
			balls: [""],
			pads: [""],
			selected_ball: "",
			selected_pad: "",
		}
	}
	type UpdateType = Dispatch<SetStateAction<typeof default_user>>;

	const defaultUpdate: UpdateType = () => default_user;

	const register = async(email: string, password: string, name: string) => "null";
	const rename = async(name: string) => "null";
	const signIn = async (email: string, password: string) => "null";
	const signOut = async () => "null";
	const profile = async (token: string) => "null";
	const isLoggedIn = () => false;

	const ctx = createContext({
		user: default_user,
		setUser: defaultUpdate,
		register: register,
		rename: rename,
		signIn: signIn,
		signOut: signOut,
		profile: profile,
		isLoggedIn: isLoggedIn
	});

	function AuthProvider(props: PropsWithChildren<{}>) {
		const [user, setUser] = useState(default_user);

		const register = async (email: string, password: string, name: string) =>
		{
			const token = await axios.post("auth/register", {
				email: email,
				password: password,
				name: name
			})
			.then(response => {
				return response.data;
			})
			.catch(e => {
				return null;
			})
			if (!token) {
				localStorage.clear();
				unset_instance_token();
				setUser(reset_user);
				return "error";
			}
			set_instance_token(token);
			setUser({...user, token: token});
			return "";
		}

		const rename = async (name: string) =>
		{
			const user = await axios.put("user/name", { name: name })
			.then(response => {
				return response.data;
			})
			.catch(e => {
				return null;
			})
			setUser({...user});
			return "";
		}

		const signIn = async (email: string, password: string) => {
			unset_instance_token();
			const token = await axios.post("auth/login", {
				email: email,
				password: password,
			})
			.then(response => {
				return response.data;
			})
			.catch(e => {
				return null;
			})
			if (!token) {
				localStorage.clear();
				unset_instance_token();
				setUser(reset_user);
				return "error";
			}
			setUser({...user, token: token});
			const name = await profile(token);
			return name;
		}

		const signOut = async () => {
			unset_instance_token();
			setUser(default_user);
			localStorage.setItem("token", "");
			return "";
		}

		const profile = async (token: string) => {
			set_instance_token(token);
			localStorage.setItem("token", token);
			const user = await axios.get("user/profile")
			.then(response => {
				return response.data;
			})
			.catch(e => {
				return null;
			})
			if (!user) {
				localStorage.clear();
				unset_instance_token();
				setUser(reset_user);
				return ""
			}
			const custom = user.custom == null || user.custom == "{}" ? {
				balls: [""],
				pads: [""],
				selected_ball: "",
				selected_pad: "",
			} : JSON.parse(user.custom);
			setUser({...user, email: user.email, token: token, store: custom, picture: !user.picture ?  null : user.picture.startsWith("https") ?  user.picture : base_url + user.picture});
			return user.name;
		}

		const isLoggedIn = () => {
			return (user.token !== "");
		}

		const storeData = (key: string, data: string) => {
			localStorage.setItem(key, data);
		}
	
		const setup = async () => {
			
		}

		useEffect(() => {
			const token = localStorage.getItem("token");
			if (token) {
				profile(token);
			}
		}, [])
		
	
		useEffect(() => {
			setup();
		}, [])
	  

		return (
			<ctx.Provider value={{ 
				user,
				setUser,
				register,
				rename,
				signIn,
				signOut,
				profile,
				isLoggedIn
			}}
			{...props} />
		);
	}
	return [ctx, AuthProvider] as const;
}