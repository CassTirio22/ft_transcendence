import React, { useContext, useEffect, useState } from 'react'
import "./style.scss"
import axios from "../../service/axios"
import { Button } from '@mui/material';
import { connect } from 'react-redux';
import { mapDispatchToProps, mapStateToProps } from '../../store/dispatcher';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../..';

type Props = {
	reference: any;
	messages?: any;
	createDirect?: any;
	fetchMessages?: any;
	selectConversation?: any;
};

type Channel = {
	members: any[]
}

let surf = false;

const ProfileView = (props: Props) => {

	const [visible, setVisible] = useState(false);
	const {user} = useContext(AuthContext);
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

	const send_direct = (id: number) => {
		const exist = props.messages.direct.filter((elem: Channel) => elem.members[0].id == id || elem.members[1].id == id)
		if (!exist.length) {
			props.createDirect(id).then((e: any) => {
				props.fetchMessages({user: user, channel_id: undefined, direct_id: e.payload});
			});
		} else {
			props.selectConversation({is_channel: false, id: exist[0].id});
		}
		setVisible(false);
		setProfile({...profile, id: -1});
	}

	useEffect(() => {
		props.reference.current = (id: string) => get_profile(id)
	}, [])

	if (!visible)
		return null;

	if (profile.id < 0)
		return null;

	let exist = props.messages.direct.filter((elem: Channel) => (elem.members[0].id == profile.id || elem.members[1].id == profile.id) && profile.id != user.id)

	if (exist.length)
		exist = exist[0].id;
	else
		exist = null;
	
	
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
								<Link to={`/conversations${exist == null ? "" : `/direct/${exist}`}`} onClick={() => send_direct(profile.id)}>Send private message</Link>
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

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);