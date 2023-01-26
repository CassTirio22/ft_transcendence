import React, { useContext, useEffect, useState } from 'react'
import "./style.scss"
import axios from "../../service/axios"
import { Button } from '@mui/material';
import { connect } from 'react-redux';
import { friendsStateToProps, mapDispatchToProps, mapStateToProps } from '../../store/dispatcher';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext, ToastContext } from '../..';
import { TOAST_LVL } from '../../constants/constants';

type Props = {
	reference: any;
	messages?: any;
	createDirect?: any;
	fetchMessages?: any;
	selectConversation?: any;
	friends?: any;
	newFriendRequest?:any;
};

type Channel = {
	members: any[]
}

let surf = false;

const ProfileView = (props: Props) => {

	const [visible, setVisible] = useState(false);
	const {user} = useContext(AuthContext);
	const navigate = useNavigate();
	const {set_toast} = useContext(ToastContext);
	const [profile, setProfile] = useState({
		id: -1,
		email: "trash.todev2@gmail.com",
		name: "tpetit2",
		score: 1000,
		gamesNumber: 0,
		status: 0,
		image: "tpetit2"
	})
	const in_friend = props.friends.filter((elem: any) => elem.id == profile.id);
	
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
		const exist = props.messages.direct.filter((elem: Channel) => elem.members[0].id == id || elem.members[1].id == id);
		if (!in_friend.length) {
			set_toast(TOAST_LVL.ERROR, "Friendship needed", `You need to be friend to send direct message to a person.`)
			return;
		}
		if (!exist.length) {
			props.createDirect(id).then((e: any) => {
				props.fetchMessages({user: user, channel_id: undefined, direct_id: e.payload});
			});
		} else {
			props.selectConversation({is_channel: false, id: exist[0].id});
			navigate(`/conversations${exist.length == 0 ? "" : `/direct/${exist[0].id}`}`);
		}
		setVisible(false);
		setProfile({...profile, id: -1});
	}

	const send_friend_request = () => {
		props.newFriendRequest(profile.id).then((e: any) => {
			if (e.payload) {
				set_toast(TOAST_LVL.SUCCESS, "Request successfuly sended", `A new friend request has been send to ${profile.name}`)
			}
		})
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
							{
								in_friend.length && profile.id != user.id ?
								<div className='profile-actions'>
									<Button onClick={() => send_direct(profile.id)} variant='contained'>Send private message</Button>
									<Button onClick={() => navigate("/")} variant='outlined'>Block</Button>
								</div> :
								profile.id != user.id ?
								<div>
									<Button onClick={() => send_friend_request()} variant='contained'>Send friend request</Button>
								</div> :
								<div>
									<Button onClick={() => {navigate("/me/profile");setProfile({...profile, id: -1})}} variant='contained'>Edit profile</Button>
								</div>
							}
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