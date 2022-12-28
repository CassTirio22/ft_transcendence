import React, { useEffect, useState } from 'react'
import "./style.scss"
import axios from "../../service/axios"
import { Button } from '@mui/material';

type Props = {
	reference: any;
};

let surf = false;

const ProfileView = (props: Props) => {

	const [visible, setVisible] = useState(false);
	const [profile, setProfile] = useState({
		id: -1,
		email: "trash.todev2@gmail.com",
		name: "tpetit2",
		score: 1000,
		gamesNumber: 0,
		status: 0,
		image: "tpetit2"
	})

	
	const get_profile = async (id: string) => {
		setVisible(true);
		const resp = await axios.get("/user/other/" + id)
			.then(r => r.data)
			.catch(e => null)
		if (!resp) {
			setVisible(false);
		}
		setProfile({...resp, image: resp.name});
	}

	useEffect(() => {
		props.reference.current = (id: string) => get_profile(id)
	}, [])

	if (!visible)
		return null;

	if (profile.id < 0)
		return null;
	
	return (
		<div id="profile-view">
			<div onClick={() => {if (!surf){setVisible(false);setProfile({...profile, id: -1})};surf = false;}} className='absolute-top-all'>
				<div onClick={() => surf = true} className='absolute-top-center'>
					<div className='profile'>
						<div className='img-container'>
							<img src={`https://avatars.dicebear.com/api/adventurer/${profile.image}.svg`} />
						</div>
						<div className='profile-content'>
							<div className='profile-actions'>
								<Button onClick={() => console.log("first")} variant='outlined'>Send private message</Button>
								<Button onClick={() => console.log("first")} variant='outlined'>Block</Button>
							</div>
							<div className='profile-data'>
								<div>Name: <span>{profile.name}</span></div>
								<div>Email: <span>{profile.email}</span></div>
								<div>Game number: <span>{profile.gamesNumber}</span></div>
								<div>Score: <span>{profile.score}</span></div>
								<div>Status: <span>{profile.status}</span></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProfileView