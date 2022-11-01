
import React, { useContext, useState } from 'react'
import { AuthContext } from '../../..';
import "./login.css"

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
		profile();
	}
	return (
		<section>
			<div className='center_div'>
				<h2>Login to you account</h2>
				<p>We are happy to see you again!</p>
			</div>
			<div className="form">
				<input placeholder='Username' type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
				<input placeholder='Password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
			</div>
			<div className="submition" onClick={handleSubmit}>
				<button>Log In</button>
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