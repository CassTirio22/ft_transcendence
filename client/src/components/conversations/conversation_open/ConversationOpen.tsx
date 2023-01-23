import { Menu, MenuItem } from '@mui/material';
import React, { createRef, useContext, useEffect, useRef } from 'react'
import { connect } from 'react-redux';
import { AuthContext, PopupContext } from '../../..';
import { mapDispatchToProps, mapStateToProps } from '../../../store/dispatcher';
import "./style.scss"

type Props = {
	messages?: any;
	fetchMessages?: any;
	selectConversation?: any;
	fetchSpecificChannel?: any,
	fetchSpecificDirect?: any
};

type Channel = {
	id: number,
	title: string,
	messages: Message[],
	members: User[]
}

type Message = {
	date: string,
	author_id: number,
	content: string
}

type User = {
	id: number,
	full_name: string,
	image_path: string
}

const ConversationOpen: React.FC<Props> = (props: Props) => {
	const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement|null>(null);
	const open = Boolean(anchorEl);
	const {user} = useContext(AuthContext);
	const {show_profile} = useContext(PopupContext);
	const scroll_view = createRef<HTMLDivElement>();

	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	useEffect(() => {
		if (scroll_view.current)
			scroll_view.current.scrollTo(0, scroll_view.current.scrollHeight);
		
			if (props.messages.current.id != -1) {
				let msg_count;
				if (props.messages.current.is_channel) {
					msg_count = props.messages.channels.filter((elem: Channel) => elem.id == props.messages.current.id)[0];
				} else {
					msg_count = props.messages.direct.filter((elem: Channel) => elem.id == props.messages.current.id)[0];
				}

				if (msg_count.messages.length <= 1) {
					if (props.messages.current.is_channel)
						props.fetchSpecificChannel(msg_count.id)
					else
						props.fetchSpecificDirect(msg_count.id)
				}
			}
		
	}, [props.messages.current])

	if (props.messages.current.id == -1) {
		return null;
	}

	let current_conversation: Channel = {} as Channel;

	if (props.messages.current.is_channel) {
		current_conversation = props.messages.channels.filter((elem: Channel) => elem.id == props.messages.current.id)[0];
	} else {
		current_conversation = props.messages.direct.filter((elem: Channel) => elem.id == props.messages.current.id)[0];
	}

	if (!current_conversation?.members || current_conversation.members.length == 0) {
		return null;
	}


	return (
		<div className='current-conversation'>
			<div className='conversation-header'>
				<div>
					<span>{current_conversation.title}</span>
				</div>
			</div>
			<div ref={scroll_view} className='conversation-body'>
				{
					[...current_conversation.messages].map((message: Message, id: number) => {
						const sender: User = current_conversation.members.filter((mem: User) => mem.id == message.author_id)[0];

						if (!sender)
							return null
						const created_at = new Date(message.date);
						return (
							<div className='message-div' key={id}>
								<div profile-id={sender.id} onClick={handleClick} className='message-sender-image-container'>
									<img src={`https://avatars.dicebear.com/api/adventurer/${sender.image_path}.svg`} />
								</div>
								<div className='message-content'>
									<div className='message-header'>
										<span className='message-sender-name'>{sender.full_name}{sender.id == user.id ? " ( you )" : ""}</span>
										<span>{created_at.toDateString()}</span>
									</div>
									<div className='message-body'>
										{message.content}
									</div>
								</div>
							</div>
						)
					})
				}
			</div>
			<div className='conversation-footer'>

			</div>
				<Menu
					id="basic-menu"
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					MenuListProps={{
					'aria-labelledby': 'basic-button',
					}}
				>
					<MenuItem onClick={() => {if (anchorEl != null){show_profile(anchorEl.getAttribute("profile-id")!)};handleClose()}}>Voir le profil</MenuItem>
					<MenuItem onClick={() => {console.log("first");handleClose()}}>Parler en priver</MenuItem>
					<MenuItem onClick={() => {console.log("first");handleClose()}}>Bloquer l'utilisateur</MenuItem>
				</Menu>
		</div>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(ConversationOpen);