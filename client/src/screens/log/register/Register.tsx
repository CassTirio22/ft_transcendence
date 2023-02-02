import { Button, TextField } from '@mui/material';
import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext, ToastContext } from '../../..';
import logo from "../../../assets/images/test.png"
import { intra_url, TOAST_LVL } from '../../../constants/constants';

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
	const {set_toast} = useContext(ToastContext);
	const navigate = useNavigate();

	const handleSubmit = async () => {
		const register_response = await register(userMail, password, userName);
		if (register_response === "error") {
			set_toast(TOAST_LVL.ERROR, "Register error", `Please use a valid email or a other username`)
		} else {
			set_toast(TOAST_LVL.SUCCESS, "Successfully register", `Welcome ${register_response}`)
			navigate("/me/profile");
		}
	}

	const validateEntry = () => {
		if (password.length < 8 || userName === "" || userMail === "")
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
				<form className="form">
					<TextField size='small' fullWidth autoComplete='email' label='Email' type="email" value={userMail} onChange={(e) => setUserMail(e.target.value)} />
					<TextField size='small' fullWidth autoComplete='username' label='Username' type="username" value={userName} onChange={(e) => setUserName(e.target.value)} />
					<TextField size='small' fullWidth autoComplete='password' onKeyDown={handleKeyDown} label='Password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				</form>
				<Button variant='outlined' href={intra_url}>Register with intra</Button>
				<Button disabled={!validateEntry()} variant="contained" onClick={handleSubmit} fullWidth >Sign up</Button>
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