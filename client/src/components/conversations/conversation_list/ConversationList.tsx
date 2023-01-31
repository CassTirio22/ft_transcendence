import React, { useContext, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { mapDispatchToProps, mapStateToProps } from '../../../store/dispatcher';
import AddIcon from '@mui/icons-material/Add';
import "./style.scss"
import CreateBox from '../../main/create_box/CreateBox';
import Checkbox from '@mui/material/Checkbox';
import { AuthContext, PopupContext, ToastContext } from '../../..';
import { generate_url, TOAST_LVL } from '../../../constants/constants';
import { Button, TextField } from '@mui/material';
import axios from "../../../service/axios"
import LockIcon from '@mui/icons-material/Lock';
import CachedIcon from '@mui/icons-material/Cached';
import CreateChannelOrDirect from "./CreateJoinChannel/CreateJoinChannel"


type Props = {
	messages?: any;
	fetchMessages?: any;
	selectConversation?: any;
	friends?: any;
	createDirect?: any;
	createChannel?: any;
	joinChannel?: any;
};

type Channel = {
	id: number,
	title: string,
	status: number
}

type Direct = {
	id: number,
	title: string,
}


const ConversationList: React.FC<Props> = (props: Props) => {

	
	const {user} = useContext(AuthContext);
	const [newConversation, setNewConversation] = useState("");
	const {set_toast} = useContext(ToastContext);
	let { channel_id, direct_id } = useParams();
	const navigate = useNavigate();
	const submit = useRef(() => {console.log("first")});
	const cancel = useRef(() => {});

	const redirect_set_conv = (is_channel: boolean, id: number) => {
		navigate(`/conversations/${is_channel ? "channel" : "direct"}/${id}`);
		props.selectConversation({is_channel: is_channel, id: id});
	}

	const fetch_conv = () => {
		props.fetchMessages({user: user, channel_id: channel_id, direct_id: direct_id}).then(() => {
			set_toast(TOAST_LVL.SUCCESS, "Fetch successfull", `Channel and direct fetch`)
		})
	}

	return (
		<div className='conversation-list'>
			<div className='conversation-list-title'>
				<h3>Canaux</h3>
				<CachedIcon onClick={() => fetch_conv()} />
			</div>
			{
				props.messages.channels.map((elem: Channel, id: number) => (
					<div onClick={() => redirect_set_conv(true, elem.id)} key={id} className={`conversation-elem${props.messages.current.id == elem.id && props.messages.current.is_channel ? " active" : ""}`}>
						<span>{elem.title}</span>
						{elem.status ? <LockIcon/> : null}
					</div>
				))
			}
			<div onClick={() => setNewConversation("channel")} className='add-box'>
				<AddIcon />
				<span>Add channel</span>
			</div>
			<h3>Messages directs</h3>
			{
				props.messages.direct.map((elem: Direct, id: number) => (
					<div onClick={() => redirect_set_conv(false, elem.id)} key={id} className={`conversation-elem${props.messages.current.id == elem.id && !props.messages.current.is_channel ? " active" : ""}`}>
						<span>{elem.title}</span>
					</div>
				))
			}
			<div onClick={() => {props.friends.length ? setNewConversation("direct") : navigate("/friends")}} className='add-box'>
				<AddIcon />
				<span>Add direct</span>
			</div>
			<CreateBox visible={newConversation != ""} submit={submit.current} submitable={true} cancel={() => setNewConversation("")} submit_text="Next" title={newConversation == "direct" ? "New direct conversation" : "New channel"}>
				<CreateChannelOrDirect cancel={cancel} submit={submit} setNewConversation={setNewConversation} newConversation={newConversation} />
			</CreateBox>
		</div>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(ConversationList);