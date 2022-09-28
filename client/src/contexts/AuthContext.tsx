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

	const ctx = createContext({
		user: default_user,
		setUser: defaultUpdate,
		signIn: signIn,
		signOut: signOut,
	});

	function AuthProvider(props: PropsWithChildren<{}>) {
		const [user, setUser] = useState(default_user);

		const signIn = async (email: string, password: string) => {
			const token = await axios.post("/api-token-auth/", {
				username: email,
				password: password,
			});
			if (token.status == 200) {
				storeData("token", token.data);
			}
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
			}}
			{...props} />
		);
	}
	return [ctx, AuthProvider] as const;
}