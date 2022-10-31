
import React, { useContext, useState } from 'react'
import { AuthContext } from '../..';
import "../../assets/stylesheets/log/login.css"

function Login() {
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
			<div className="form" onClick={handleSubmit}>
				<input placeholder='Username' type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
				<input placeholder='Password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				<button>hello</button>
			</div>
		</section>
	)
}

export default Login