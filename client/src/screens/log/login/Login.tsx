
import React, { useContext, useState } from 'react'
import { AuthContext } from '../../..';
import "./login.scss"
import logo from "../../../assets/images/test.png"
import Button from '../../../components/button/Button';

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
	const [userName, setUserName] = useState("test201@test.com");
	const [password, setPassword] = useState("test1234");
	const {user, signIn, profile} = useContext(AuthContext)
	const handleSubmit = async () => {
		await signIn(userName, password);
	}
	return (
		<section className='login'>
			<div className='center_div'>
				<img src={logo} />
				<h2>Sign in</h2>
			</div>
			<div className="form">
				<input placeholder='Username' type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
				<input placeholder='Password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
			</div>
			<Button title="Sign in" onPress={handleSubmit} width="300px" />
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