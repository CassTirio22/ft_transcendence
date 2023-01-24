
import React, { useContext, useState } from 'react'
import { AuthContext, PopupContext, ToastContext } from '../../..';
import "./login.scss"
import logo from "../../../assets/images/test.png"
import Button from '../../../components/button/Button';
import { TOAST_LVL } from '../../../constants/constants';

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

	const handleSubmit = async () => {
		const response = await signIn(userName, password);
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
			<form className="form" onSubmit={() => console.log("first")}>
				<input autoComplete='username' placeholder='Email or username' type="username" value={userName} onChange={(e) => setUserName(e.target.value)} />
				<input autoComplete='password' onKeyDown={handleKeyDown} placeholder='Password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
			</form>
			<Button disable={!validateEntry()} title="Sign in" onPress={handleSubmit} width="300px" />
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