import React, { Dispatch, PropsWithChildren, SetStateAction, useEffect }  from 'react'
import { createContext, useState } from 'react';
import { isCompositeComponent } from 'react-dom/test-utils';
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

	const register = async(email: string, password: string, name?: string) => "null";
	const signIn = async (email: string, password: string) => "null";
	const signOut = async () => "null";
	const profile = async () => "null";
	const isLoggedIn = () => false;

	const ctx = createContext({
		user: default_user,
		setUser: defaultUpdate,
		register: register,
		signIn: signIn,
		signOut: signOut,
		profile: profile,
		isLoggedIn: isLoggedIn
	});

	function AuthProvider(props: PropsWithChildren<{}>) {
		const [user, setUser] = useState(default_user);

		const register = async (email: string, password: string, name?: string) =>
		{
			const token = await axios.post("auth/register", {
				email: email,
				password: password,
				name: name
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

		const signIn = async (email: string, password: string) => {
			unset_instance_token();
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
		}

		const profile = async () => {
			console.log("try to register!");
			const token = await axios.post("auth/refresh"/*, {user}, { withCredentials: true }*/)
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
		}

		const isLoggedIn = () => {
			return (user.token != null);
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
				register,
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