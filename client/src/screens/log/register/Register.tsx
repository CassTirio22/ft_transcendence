import React, { useContext, useState } from 'react'
import { AuthContext } from '../../..';
import logo from "../../../assets/images/test.png"
import Button from '../../../components/button/Button';

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
			const login_response = await signIn(userMail, password);
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
			<form className="form">
				<input autoComplete='email' placeholder='Email' type="email" value={userMail} onChange={(e) => setUserMail(e.target.value)} />
				<input autoComplete='new-password' placeholder='Username' type="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
				<input autoComplete='new-password' onKeyDown={handleKeyDown} placeholder='Password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
			</form>
			<Button disable={!validateEntry()} title="Sign up" onPress={handleSubmit} width="300px" />
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