import React, { Dispatch, PropsWithChildren, SetStateAction, useEffect }  from 'react'
import { createContext, useState } from 'react';
import axios, { set_instance_token, unset_instance_token } from "../service/axios"

export function createCtx() {
	const default_user = {
		first_name: "Anonymous",
		last_name: "User",
		token: null,
		profile_picture: "https://avatars.dicebear.com/api/avataaars/your-custom-seed.png",
	}
	type UpdateType = Dispatch<SetStateAction<typeof default_user>>;

	const defaultUpdate: UpdateType = () => default_user;

	const signIn = async (email: string, password: string) => "null";
	const signOut = async () => "null";
	const profile = async () => "null";

	const ctx = createContext({
		user: default_user,
		setUser: defaultUpdate,
		signIn: signIn,
		signOut: signOut,
		profile: profile,
	});

	function AuthProvider(props: PropsWithChildren<{}>) {
		const [user, setUser] = useState(default_user);

		const signIn = async (email: string, password: string) => {
			const token = await axios.post("auth/login", {
				email: email,
				password: password,
			})
			.then(response => {
				console.log(response.data)
				return response.data;
			})
			.catch(e => {
				console.log(e)
				return null;
			})
			set_instance_token(token);
			setUser({...user, token: token});
			return "";
		}

		const signOut = async () => {
			console.log("first")

			return "";
			setUser({
				first_name: "Anonymous",
				last_name: "User",
				token: null,
				profile_picture: "https://avatars.dicebear.com/api/avataaars/your-custom-seed.png",
			});
			storeData("token", "");
			unset_instance_token();
		}

		const profile = async () => {
			const token = await axios.post("auth/refresh")
			.then(response => {
				console.log(response.data)
				return response.data;
			})
			.catch(e => {
				console.log(e)
				return null;
			})
			setUser({...user, token: token});
			return "";
			return "";
		}

		const storeData = (key: string, data: string) => {
			localStorage.setItem(key, data);
		}
	
		const setup = async () => {
			
		}
	
		useEffect(() => {
			setup();
		}, [])
	  

		return (
			<ctx.Provider value={{ 
				user,
				setUser,
				signIn,
				signOut,
				profile,
			}}
			{...props} />
		);
	}
	return [ctx, AuthProvider] as const;
}