
import React, { useContext, useState } from 'react'
import { AuthContext, PopupContext, ToastContext } from '../../..';
import "./login.scss"
import logo from "../../../assets/images/test.png"
import { TOAST_LVL } from '../../../constants/constants';
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function AlreadyLogged() {
	return (
		<section>
			<div className='logged'>
				<h2>You are already logged in</h2>
				<p>Please log out if you want to register a new account.</p>
			</div>
		</section>
	)
}

function LogInForm()
{
	const [userName, setUserName] = useState("1@gmail.com");
	const [password, setPassword] = useState("12345678");
	const {user, signIn, profile} = useContext(AuthContext)
	const {set_toast} = useContext(ToastContext);
	const navigate = useNavigate();

	const handleSubmit = async () => {
		const response = await signIn(userName, password);
		navigate("/");
		if (response == "error") {
			console.log(response)
		} else {
			set_toast(TOAST_LVL.SUCCESS, "Successfully login", `Welcome ${response}`)
		}
	}

	const validateEntry = () => {
		if (password == "" || userName == "")
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
				<img src={logo} />
				<h2>Sign in</h2>
			</div>
			<div className='center-input'>
				<form className="form" onSubmit={() => console.log("first")}>
					<TextField size='small' fullWidth autoComplete='username' label='Email or username' type="username" value={userName} onChange={(e) => setUserName(e.target.value)} />
					<TextField size='small' fullWidth autoComplete='password' onKeyDown={handleKeyDown} label='Password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				</form>
				<Button disabled={!validateEntry()} variant="contained" onClick={handleSubmit} fullWidth >Sign in</Button>
			</div>
		</section>
	)
}

function Login() {
	const {isLoggedIn} = useContext(AuthContext)
	if (isLoggedIn()) {
		return <AlreadyLogged />
	}
	else {
		return <LogInForm />
	}
}

export default Login