import { Button, TextField } from '@mui/material';
import React, { useContext, useState } from 'react'
import { AuthContext } from '../../..';
import logo from "../../../assets/images/test.png"
import { intra_url } from '../../../constants/constants';

function AlreadyRegistered() {
	return (
		<section>
			<div className='registered'>
				<h2>You are already logged in.</h2>
				<p>Please log out if you want to use another account.</p>
			</div>
		</section>
	)
}

function RegistrationForm() {
	const [userMail, setUserMail] = useState("");
	const [password, setPassword] = useState("");
	const [userName, setUserName] = useState("");
	const {user, signIn, register, profile} = useContext(AuthContext)

	const handleSubmit = async () => {
		const register_response = await register(userMail, password, userName);
		if (register_response === "error") {
			alert("error");
		}
		else {
			const login_response = await signIn(userMail, password, null);
			if (login_response === "error") {
				alert("error");
			}
		}
	}

	const validateEntry = () => {
		if (password === "" || userName === "" || userMail === "")
			return false;
		return true;
	}

	const handleKeyDown = (event: any) => {
		if (event.key === 'Enter' && validateEntry()) {
			handleSubmit();
		}
	};


	return (
		<section className='login'>
			<div className='center_div'>
				<img src={logo} alt="logo" />
				<h2>Sign up</h2>
			</div>
			<div className='center-input'>
				<form className="form" onSubmit={() => console.log("first")}>
					<TextField size='small' fullWidth autoComplete='email' label='Email' type="email" value={userMail} onChange={(e) => setUserMail(e.target.value)} />
					<TextField size='small' fullWidth autoComplete='username' label='Username' type="username" value={userName} onChange={(e) => setUserName(e.target.value)} />
					<TextField size='small' fullWidth autoComplete='password' onKeyDown={handleKeyDown} label='Password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				</form>
				<Button variant='outlined' href={intra_url}>Register with intra</Button>
				<Button disabled={!validateEntry()} variant="contained" onClick={handleSubmit} fullWidth >Sign in</Button>
			</div>
		</section>
	)
}

function Register() {
	const {isLoggedIn} = useContext(AuthContext)
	if (isLoggedIn()) {
		return <AlreadyRegistered />
	}
	else {
		return <RegistrationForm />
	}
}

export default Register