
import React, { useContext, useState } from 'react'
import { AuthContext } from '../..';
import "./profile.scss"
import Button from '../../components/button/Button';
import { debug } from 'console';


function ProfileCustomization() {
	const {user, rename} = useContext(AuthContext)
	const [changing, setChanging] = useState(false);
	const [pseudo, setPseudo] = useState(user.pseudo);

	const handleSubmit = async () => {
		await rename(pseudo);
		console.log("User is renamed");
		setChanging(false);
	}

	const validateEntry = () => {
		if (pseudo == "")
			return false;
		return true;
	}

	let change;
	if (changing == false) {
		return (
			<Button title="Change my profile" onPress={() => setChanging(true)} width="300px" />
		)
	}
	else {
		return (
			<section className='changeProfile'>
				<form className='fillChanges'>
					<div>Name : </div>
					<input autoComplete='name' placeholder="pseudo" type="name" value={pseudo} onChange={(e) => setPseudo(e.target.value)} />
				</form>
				<Button disable={!validateEntry()} title="Update my profile" onPress={handleSubmit} width="300px" />
			</section>
		)
	}
}

function Profile() {
	const {user} = useContext(AuthContext)
	console.log("TEST:" + user.pseudo);
	return (
		<section className='profile'>
			<div className='name'>
				<h1>{user.pseudo}</h1>
			</div>
			<div className='mail'>
				<h3>{user.email}</h3>
			</div>
			<ProfileCustomization />
		</section>
	)
}

export default Profile
