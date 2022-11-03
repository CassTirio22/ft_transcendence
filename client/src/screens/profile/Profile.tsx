
import React, { useContext, useState } from 'react'
import "./profile.scss"
import Button from '../../components/button/Button';


function ProfileCustomization() {
	const [changing, setChanging] = useState(false);

	function ChangeProfileForm() {
		return (
			<section className='changeProfile'>
				<form className='fillChanges'>
					<div>Name : </div>
					<input autoComplete='name'/>
				</form>
				<Button title="Update my profile" onPress={() => setChanging(false)} width="300px" />
			</section>
		)
	}

	let change;
	if (changing == false) {
		return (
			<Button title="Change my profile" onPress={() => setChanging(true)} width="300px" />
		)
	}
	else {
		return (
			<ChangeProfileForm />
		)
	}
}

function Profile() {
	return (
		<section className='profile'>
			<div className='name'>
				<h1>My Name</h1>
			</div>
			<div className='mail'>
				<h3>test@mail.com</h3>
			</div>
			<ProfileCustomization />
		</section>
	)
}

export default Profile