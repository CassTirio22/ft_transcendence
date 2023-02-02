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
	},
	phone: ""
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
		},
		phone: ""
	}
	type UpdateType = Dispatch<SetStateAction<typeof default_user>>;

	const defaultUpdate: UpdateType = () => default_user;

	const register = async(email: string, password: string, name: string) => "null";
	const rename = async(name: string) => "null";
	const signIn = async (email: string, password: string, twoFa: string | null) => "null";
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
				setUser({...reset_user});
				return "error";
			}
			const namee = await profile(token);
			return namee;
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

		const signIn = async (email: string, password: string, twoFa: string | null) => {
			unset_instance_token();
			const token = await axios.post("auth/login", {
				email: email,
				password: password,
				code: twoFa
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
				setUser({...reset_user});
				return "error";
			} else if (token.length < 16) {
				return token;
			}
			const name = await profile(token);
			// feature not a bullshit
			return `aaaaaaaaaaaaaaaaaaaa${name}`;
		}

		const signOut = async () => {
			unset_instance_token();
			setUser(default_user);
			localStorage.setItem("token", "");
			return "";
		}

		const profile = async (token: string) => {
			console.log(token)
			localStorage.clear();
			set_instance_token(token);
			localStorage.setItem("token", token);
			const user_get = await axios.get("user/profile")
			.then(response => {
				return response.data;
			})
			.catch(e => {
				console.log(e)
				return null;
			})
			if (!user_get) {
				localStorage.clear();
				unset_instance_token();
				setUser({...reset_user});
				return ""
			}
			console.log(user_get)
			const custom = user_get.custom == null || user_get.custom == "{}" ? {
				balls: [""],
				pads: [""],
				selected_ball: "",
				selected_pad: "",
			} : JSON.parse(user_get.custom);
			setUser({...user_get, email: user_get.email, token: token, store: custom, picture: !user_get.picture ?  null : user_get.picture.startsWith("http") ?  user_get.picture : base_url + user_get.picture});
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