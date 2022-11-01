import React, { useContext, useState } from 'react'
import { AuthContext } from '../..';

function Register() {
	const [userMail, setUserMail] = useState("");
	const [password, setPassword] = useState("");
	const [userName, setUserName] = useState("");
	const {user, register, profile} = useContext(AuthContext)
	const handleSubmit = async () => {
		await register(userMail, password, userName);
		profile();
	}
  return (
	<section>
		<div className='center_div'>
			<h2>Register to create an account!</h2>
		</div>
		<div className="form">
			<input placeholder='Mail' type="text" value={userMail} onChange={(e) => setUserMail(e.target.value)} />
			<input placeholder='Username' type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
			<input placeholder='Password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
		</div>
		<div className="submition" onClick={handleSubmit}>
			<button>Register</button>
		</div>
	</section>
  )
}

export default Register