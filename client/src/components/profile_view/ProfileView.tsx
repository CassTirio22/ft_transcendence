import React, { useContext, useEffect, useState } from 'react'
import "./style.scss"
import axios from "../../service/axios"
import { Button } from '@mui/material';
import { connect } from 'react-redux';
import { friendsStateToProps, mapDispatchToProps, mapStateToProps } from '../../store/dispatcher';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext, ToastContext } from '../..';
import { base_url, generate_url, TOAST_LVL } from '../../constants/constants';

type Props = {
	reference: any;
	messages?: any;
	createDirect?: any;
	fetchMessages?: any;
	selectConversation?: any;
	friends?: any;
	newFriendRequest?:any;
	blocked?: any;
	blockUser?: any;
	unBlockUser?: any;
	fetchBlockeds?: any;
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
		picture: ""
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
		setProfile({...resp});
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

	const toggle_block = (is_blocked: boolean) => {
		if (is_blocked) {
			props.unBlockUser(profile.id).then(() => {
				props.fetchBlockeds();
			});
		} else {
			props.blockUser(profile.id).then(() => {
				props.fetchBlockeds();
			});
		}
	}

	let status = props.friends.filter((elem: any) => elem.id == profile.id);
    if (status.length) {
		if (status[0].status == 2)
            status = "in-game"
        else if (!status[0].status)
            status = "connected"
        else
            status = "disconnected"
    } else {
        status = "unknown"
    }
    if (profile.id == user.id)
        status = "connected"

	if (props.blocked.filter((elem: any) => elem.id == profile.id).length) {
		status = "blocked"
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
						<div className='profile-top'>
							<div className='img-container'>
							<img src={generate_url(profile)} />
							</div>
							<div className='profile-top-right'>
								<div className='profile-name-status'>
									<h1>{profile.name}</h1>
									<span><span className={`bubble ${status}`}></span>{status}</span>
								</div>
								<div className='profile-content'>
									{
										in_friend.length && profile.id != user.id ?
										<div className='profile-actions'>
											<Button onClick={() => send_direct(profile.id)} variant='contained'>Send private message</Button>
											<Button onClick={() => toggle_block(status=="blocked")} variant='outlined'>{status != "blocked" ? "Block" : "Unblock"}</Button>
										</div> :
										profile.id != user.id ?
										<div>
											<Button onClick={() => send_friend_request()} variant='contained'>Send friend request</Button>
										</div> :
										<div>
											<Button onClick={() => {navigate("/me/profile");setProfile({...profile, id: -1})}} variant='contained'>Edit profile</Button>
										</div>
									}
								</div>
							</div>
						</div>
						<div className='profile-data'>
							<div><span>Game number</span><span>{profile.gamesNumber}</span></div>
							<div><span>Score</span><span>{profile.score}</span></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);