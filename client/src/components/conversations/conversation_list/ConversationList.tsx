import React, { useContext, useRef, useState } from 'react'
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { mapDispatchToProps, mapStateToProps } from '../../../store/dispatcher';
import AddIcon from '@mui/icons-material/Add';
import "./style.scss"
import CreateBox from '../../main/create_box/CreateBox';
import Checkbox from '@mui/material/Checkbox';
import { AuthContext, PopupContext, ToastContext } from '../../..';
import { TOAST_LVL } from '../../../constants/constants';


type Props = {
	messages?: any;
	fetchMessages?: any;
	selectConversation?: any;
	friends?: any;
	createDirect?: any;
};

type Channel = {
	id: number,
	title: string,
}

type ChannelFull = {
	members: any[]
}

type Direct = {
	id: number,
	title: string,
}


const ConversationList: React.FC<Props> = (props: Props) => {

	const [newConversation, setNewConversation] = useState("");
	const {user} = useContext(AuthContext);
	const selected = useRef<number[]>([]);
	const {set_toast} = useContext(ToastContext);

	const navigate = useNavigate();

	const redirect_set_conv = (is_channel: boolean, id: number) => {
		navigate(`/conversations/${is_channel ? "channel" : "direct"}/${id}`);
		props.selectConversation({is_channel: is_channel, id: id});
	}

	const submit = () => {
		if (newConversation == "direct") {
			if (!selected.current.length) {
				set_toast(TOAST_LVL.WARNING, "Selection needed", `Please select one friend to talk with`)
				return;
			}
			const id = selected.current[0]
			const exist = props.messages.direct.filter((elem: ChannelFull) => elem.members[0].id == id || elem.members[1].id == id)
			if (!exist.length) {
				props.createDirect(id).then((e: any) => {
					props.fetchMessages({user: user, channel_id: undefined, direct_id: e.payload});
				});
			} else {
				props.selectConversation({is_channel: false, id: exist[0].id});
			}
			selected.current = [];
			setNewConversation("");
		}
	}

	const CreateChannelOrDirect = () => {

		const [toggle, setToggle] = useState(false);

		const toggle_id = (id: number) => {
			if (newConversation == "direct") {
				if (selected.current.length && selected.current[0] == id)
					selected.current = []
				else {
					selected.current = [id];
				}
			} else {
				if (selected.current.includes(id)) {
					selected.current.splice(selected.current.indexOf(id), 1)
				} else {
					selected.current.push(id)
				}
			}
			setToggle(!toggle);
		}

		return (
			<div className='create-conversation'>
				<h4>{newConversation == "direct" ? "Select friend to talk in private" : "Select friends to create a channel"}</h4>
				<div className='friends-wrapper'>
					{
						props.friends.map((elem: any) => {
							return (
								<div key={elem.id} className="friend-elem">
									<div className='friend-picture-name'>
										<div className='image-div'>
											<img src={`https://avatars.dicebear.com/api/adventurer/${elem.name}.svg`} />
										</div>
										<span>{elem.name}</span>
									</div>
									<Checkbox checked={selected.current.includes(elem.id)} onChange={() => toggle_id(elem.id)} />
								</div>
							)
						})
					}
				</div>
			</div>
		)
	}

	return (
		<div className='conversation-list'>
			<h3>Canaux</h3>
			{
				props.messages.channels.map((elem: Channel, id: number) => (
					<div onClick={() => redirect_set_conv(true, elem.id)} key={id} className={`conversation-elem${props.messages.current.id == elem.id && props.messages.current.is_channel ? " active" : ""}`}>
						<span>{elem.title}</span>
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
			<div onClick={() => setNewConversation("direct")} className='add-box'>
				<AddIcon />
				<span>Add direct</span>
			</div>
			<CreateBox visible={newConversation != ""} submit={submit} submitable={true} cancel={() => {selected.current = [];setNewConversation("")}} submit_text="Create" title={newConversation == "direct" ? "New direct conversation" : "New channel"}>
				<CreateChannelOrDirect/>
			</CreateBox>
		</div>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(ConversationList);