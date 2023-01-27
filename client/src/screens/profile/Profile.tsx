
import React, { useContext, useRef, useState } from 'react'
import { AuthContext, PopupContext } from '../..';
import "./profile.scss"
import { debug } from 'console';
import { Button, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { base_url, TOAST_LVL } from '../../constants/constants';
import axios from "../../service/axios"


function Profile() {
	const {user, profile} = useContext(AuthContext)
	const [file, setFile] = useState<any | null>(null);
	const {open_confirm, set_toast} = useContext(PopupContext)
	const [userName, setUserName] = useState(user.name);
	const [password, setPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	console.log(user.picture)

	const change_picture = async (file_list: FileList | null) => {
		if (file_list) {
			const file = file_list[0];
			const formData = new FormData();
			formData.append("file", file);
			formData.append("name", "name");
			const result = await axios.post("/user/uploadPicture", formData)
			.then(e => e.data)
			.catch(e => {console.log(e);return null})
			profile(user.token);
		}
	}

	const save_changes = async () => {
		const change = await axios.put("/user/edit", {
			name: userName
		})
		.then(e => e.data)
		.catch(e => null)
		if (change) {
			
			profile(change);
			setTimeout(() => {
				set_toast(TOAST_LVL.SUCCESS, "Updated", "Your profile has been correctly updated");
			}, 100);
		}
	}

	const change_password = async () => {
		const change = await axios.put("/user/edit", {
			password: password
		})
		.then(e => e.data)
		.catch(e => null)
		if (change) {
			profile(change);
			setTimeout(() => {
				set_toast(TOAST_LVL.SUCCESS, "Updated", "Your password has been correctly updated");
			}, 100);
			setPassword("");
			setNewPassword("");
		}
	}

	const delete_picture = async (need_ask: boolean) => {
		if (need_ask && user.picture) {
			open_confirm("Delete profile picture", "You will remove your profile picture. This action is definitive. A random profile picture will be created for you", "Delete my picture", () => delete_picture(false))
		} else if (!need_ask && user.picture) {
			const result = await axios.delete("/user/deletePicture");
			profile(user.token);
		}
	}

	const cancel = () => {
		setUserName(user.name);
		setPassword("");
		setNewPassword("");
	}

	return (
		<div id='profile-main'>
			<h1>My profile</h1>
			<p>Manage your profile settings</p>

			<div className='update-picture-container'>
				<h2>My profile picture</h2>
				<div className='img-edit'>
					<img src={user.picture ? base_url + user.picture.split("ft_transcendence/server")[1] : `https://avatars.dicebear.com/api/adventurer/${user.name}.svg`} />
					<div className="profile-picture-edit">
						<label htmlFor="inputTag">
							Change profile picture
							<input id="inputTag" type="file" onChange={e => change_picture(e.target?.files)}/>
						</label>
						{
							user.picture ? <Button sx={{color: "red"}} variant="outlined" startIcon={<DeleteIcon />} onClick={() => delete_picture(true)}>Delete</Button> : null
						}
					</div>
				</div>
			</div>
			<div className='update-container'>
				<h2>My data</h2>
				<TextField value={userName} onChange={(e) => setUserName(e.target.value)} fullWidth  className='value-input' label={"User name"} variant="outlined" />
			</div>
			<div className='change-password'>
				<h2>Change password</h2>
				<form className='password-row'>
					<TextField autoComplete='username' sx={{display: "none"}} />
					<TextField autoComplete='new-password' type={"password"} fullWidth value={password} onChange={(e) => setPassword(e.target.value)} className='value-input' label={"New password"} variant="outlined" />
					<TextField autoComplete='new-password' type={"password"} fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className='value-input' label={"New password confirmation"} variant="outlined" />
					<Button disabled={password.length < 6 || newPassword != password} variant="contained" onClick={() => change_password()}>Save password</Button>
				</form>
			</div>
			<div className='update-footer'>
				<Button variant="outlined" onClick={cancel}>Cancel</Button>
				<Button disabled={userName == user.name} variant="contained" onClick={() => save_changes()}>Save changes</Button>
			</div>
		</div>
	)
}

export default Profile
