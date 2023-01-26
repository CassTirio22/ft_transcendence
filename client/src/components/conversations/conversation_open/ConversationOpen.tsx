import { Button, Menu, MenuItem, TextareaAutosize } from '@mui/material';
import React, { createRef, useContext, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext, PopupContext, SocketContext } from '../../..';
import { mapDispatchToProps, mapStateToProps } from '../../../store/dispatcher';
import { sendChannel, sendDirect } from '../../../store/slices/messages';
import "./style.scss"
import no_yet from "../../../assets/images/no_friends_yet.svg"
import ImageBox from '../../main/image_box/ImageBox';

type Props = {
	messages?: any;
	fetchMessages?: any;
	selectConversation?: any;
	fetchSpecificChannel?: any,
	fetchSpecificDirect?: any,
	sendDirect?: any,
	sendChannel?: any
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
	const {send_message} = useContext(SocketContext);
	const {show_profile} = useContext(PopupContext);
	const scroll_view = createRef<HTMLDivElement>();
	let { channel_id, direct_id } = useParams();
	let navigate = useNavigate();

	useEffect(() => {
		if (scroll_view.current)
			scroll_view.current.scrollTo(0, scroll_view.current.scrollHeight);
		
			if (props.messages.current.id != -1) {
				let msg_count;
				if (props.messages.current.is_channel) {
					msg_count = props.messages.channels.filter((elem: Channel) => elem.id == props.messages.current.id);
					if (msg_count.length)
						msg_count = msg_count[0]
					else
						msg_count = null;
				} else {
					msg_count = props.messages.direct.filter((elem: Channel) => elem.id == props.messages.current.id);
					if (msg_count.length)
						msg_count = msg_count[0]
					else
						msg_count = null;
				}

				if (msg_count && msg_count.messages.length <= 1) {
					if (props.messages.current.is_channel) {
						props.fetchSpecificChannel(msg_count.id)
						navigate(`/conversations/channel/${msg_count.id}`)
					}
					else {
						props.fetchSpecificDirect(msg_count.id)
						navigate(`/conversations/direct/${msg_count.id}`)
					}
				}
			}
		
	}, [props.messages.current])

	useEffect(() => {
		if (scroll_view.current)
			scroll_view.current.scrollTo(0, scroll_view.current.scrollHeight);
	}, [scroll_view])

	const RenderSend = () => {
		const [message, setMessage] = useState("");
		const last_key = useRef("");
		const need_add = useRef(true);

		const send = () => {
			if (channel_id) {
				props.sendChannel({origin: parseInt(channel_id), content: message})
			} else if (direct_id) {
				props.sendDirect({origin: parseInt(direct_id), content: message})
			}
			send_message(direct_id ? parseInt(direct_id) : null, channel_id ? parseInt(channel_id) : null, message);
			setMessage("");
			need_add.current = true;
			setTimeout(() => {
				document.getElementById("message-input")?.focus();
			}, 100);
		}

		const set_message_shift = (key: string) => {
			if (key == "Enter" && last_key.current != "Shift") {
				need_add.current = false;
				send();
			} else {
				last_key.current = key;
			}
		}

		return (
			<div className='conversation-footer'>
				<div className='new-message'>
					<TextareaAutosize
						id={"message-input"}
						autoFocus
						className='text-area-new'
						placeholder='Send a message'
						value={message}
						onChange={(e) => need_add ? setMessage(e.target.value) : null}
						onKeyDown={(e) => set_message_shift(e.key)}
						maxRows={5}
					/>
					<div className='send-message'>
						<Button disabled={message == ""} onClick={() => send()} variant='outlined'>Send</Button>
					</div>
				</div>
			</div>
		)
	}

	const EmptyConvOrSelect = () => {
		return (
			<div className='current-conversation empty'>
				<div className='current-empty-div'>
					<h1>Welcome to your conversations</h1>
					<p>Select one of your conversations or create one from the menu on the left of the screen to start chatting with crazy pong players!</p>
				</div>
			</div>
		)
	}
	

	if (props.messages.current.id == -1) {
		return <EmptyConvOrSelect/>;
	}

	let current_conversation: Channel = {} as Channel;

	if (props.messages.current.is_channel) {
		current_conversation = props.messages.channels.filter((elem: Channel) => elem.id == props.messages.current.id)[0];
	} else {
		current_conversation = props.messages.direct.filter((elem: Channel) => elem.id == props.messages.current.id)[0];
	}

	if (!current_conversation?.members || current_conversation.members.length == 0) {
		return <EmptyConvOrSelect/>;
	}


	return (
		<div className='current-conversation'>
			<div className='conversation-header'>
				<div>
					<span>{current_conversation.title}</span>
				</div>
			</div>
			<div className='body-header-container'>
				<div ref={scroll_view} className='conversation-body'>
					{
						current_conversation.messages.length == 0 && current_conversation.members.length == 1 ? 
						<div className='empty-channel'>
							<img src={no_yet} />
							<h2>There is no member in this channel</h2>
							<p>Invite members in your channel to start chatting with them!</p>
							<Button>Add members</Button>
						</div>
						: null
					}
					{
						[...current_conversation.messages].map((message: Message, id: number) => {
							const sender: User = current_conversation.members.filter((mem: User) => mem.id == message.author_id)[0];

							if (!sender)
								return null
							const created_at = new Date(message.date);
							return (
								<div className='message-div' key={id}>
									<ImageBox is_you={user.id == sender.id} user={sender} onClick={() =>show_profile(sender.id.toString())} />
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
				<RenderSend/>
			</div>
		</div>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(ConversationOpen);