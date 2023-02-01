import { Button, Menu, MenuItem, TextareaAutosize } from '@mui/material';
import React, { createRef, useContext, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext, PopupContext, SocketContext, ToastContext } from '../../..';
import { mapDispatchToProps, mapStateToProps, messagesStateToProps } from '../../../store/dispatcher';
import { sendChannel, sendDirect } from '../../../store/slices/messages';
import "./style.scss"
import no_yet from "../../../assets/images/no_friends_yet.svg"
import ImageBox from '../../main/image_box/ImageBox';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { CONV_LVL, TOAST_LVL } from '../../../constants/constants';
import axios from "../../../service/axios"

type Props = {
	messages?: any;
	fetchMessages?: any;
	selectConversation?: any;
	fetchSpecificChannel?: any,
	fetchSpecificDirect?: any,
	sendDirect?: any,
	sendChannel?: any,
	status?: any
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
	name: string,
	picture: string,
	status: number
}

const RenderSend = (props: Props) => {
	const [message, setMessage] = useState("");
	const last_key = useRef("");
	const need_add = useRef(true);
	const {set_toast} = useContext(ToastContext);
	const {send_message} = useContext(SocketContext);
	const {user} = useContext(AuthContext);
	let { channel_id, direct_id } = useParams();

	const send = () => {
		if (channel_id) {
			props.sendChannel({origin: parseInt(channel_id), content: message}).then((e: any) => {
				if (e.error?.message?.includes("401")) {
					props.fetchMessages({user: user, channel_id: null, direct_id: null});
					setTimeout(() => {
						set_toast(TOAST_LVL.ERROR, "Unauthorize", "You cannot send message to this channel. You have probably been kiked or banned.")
					}, 100);
				}
			})
		} else if (direct_id) {
			props.sendDirect({origin: parseInt(direct_id), content: message}).then((e: any) => {
				if (e.error?.message?.includes("401")) {
					props.fetchMessages({user: user, channel_id: null, direct_id: null});
					setTimeout(() => {
						set_toast(TOAST_LVL.ERROR, "Unauthorize", "You cannot send message to this user. He has probably blocked you.")
					}, 100);
				}
			})
		}
		send_message(direct_id ? parseInt(direct_id) : null, channel_id ? parseInt(channel_id) : null, message);
		setMessage("");
		setTimeout(() => {
			document.getElementById("message-input")?.focus();
		}, 100);
	}

	const set_message_shift = (key: string, e: any) => {
		if (key == "Enter" && last_key.current != "Shift") {
			e.preventDefault();
			if (message != "")
				send();
		} else {
			last_key.current = key;
		}
	}

	if (props.status != undefined && props.status != 0)
		return null;

	return (
		<div className='conversation-footer'>
			<div className='new-message'>
				<TextareaAutosize
					id={"message-input"}
					autoFocus
					className='text-area-new'
					placeholder='Send a message'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={(e) => set_message_shift(e.key, e)}
					maxRows={5}
				/>
				<div className='send-message'>
					<Button disabled={message == ""} onClick={() => send()} variant='outlined'>Send</Button>
				</div>
			</div>
		</div>
	)
}

const ConversationOpen: React.FC<Props> = (props: Props) => {
	const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement|null>(null);
	const open = Boolean(anchorEl);
	const {user} = useContext(AuthContext);
	let { channel_id, direct_id } = useParams();
	const {show_profile} = useContext(PopupContext);
	const scroll_view = createRef<HTMLDivElement>();
	const {set_toast} = useContext(ToastContext);
	let navigate = useNavigate();
	const {send_message} = useContext(SocketContext);

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

	const send = (message: string) => {
		if (channel_id) {
			props.sendChannel({origin: parseInt(channel_id), content: message}).then((e: any) => {
				if (e.error?.message?.includes("401")) {
					props.fetchMessages({user: user, channel_id: null, direct_id: null});
					setTimeout(() => {
						set_toast(TOAST_LVL.ERROR, "Unauthorize", "You cannot send message to this channel. You have probably been kiked or banned.")
					}, 100);
				}
			})
		} else if (direct_id) {
			props.sendDirect({origin: parseInt(direct_id), content: message}).then((e: any) => {
				if (e.error?.message?.includes("401")) {
					props.fetchMessages({user: user, channel_id: null, direct_id: null});
					setTimeout(() => {
						set_toast(TOAST_LVL.ERROR, "Unauthorize", "You cannot send message to this user. He has probably blocked you.")
					}, 100);
				}
			})
		}
		send_message(direct_id ? parseInt(direct_id) : null, channel_id ? parseInt(channel_id) : null, message);
		setTimeout(() => {
			document.getElementById("message-input")?.focus();
		}, 100);
	}

	const launch_game = async () => {
		const ret = await axios.post("/game/create", {friendly: true})
			.then(e => e.data)
			.catch(e => null);
		if (ret) {
			send(`##frien-game##:${ret.address}`);
			navigate(`/play/${ret.address}`);
		}
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

	const user_status = current_conversation.members.filter((elem: any) => elem.id == user.id)[0].status;

	return (
		<div className='current-conversation'>
			<div className='conversation-header'>
				<div>
					<span>{current_conversation.title}</span>
					<Button size='small' onClick={() => launch_game()} variant='outlined'>Launch game</Button>
				</div>
				{
					props.messages.current.is_channel ?
					<MoreHorizIcon onClick={() => navigate("infos")} /> : null
				}
			</div>
			<div className='body-header-container'>
				<div ref={scroll_view} className='conversation-body'>
					{
						current_conversation.messages.length == 0 && current_conversation.members.length == 1 ? 
						<div className='empty-channel'>
							<img src={no_yet} />
							<h2>There is no member in this channel</h2>
							<p>Invite members in your channel to start chatting with them!</p>
							<Button onClick={() => navigate("infos")}>Add members</Button>
						</div>
						: null
					}
					{
						[...current_conversation.messages].map((message: Message, id: number) => {
							const sender: User = current_conversation.members.filter((mem: User) => mem.id == message.author_id)[0];
							if (!sender)
								return null
							const created_at = new Date(message.date);

							if (message.content.startsWith("##frien-game##:")) {
								const yet_join_lst = current_conversation.messages.filter((elem: any) => elem.content.startsWith(`##frien-join##:${message.content.substring(15)}`));
								let yet_id = -1;
								if (yet_join_lst.length) {
									yet_id = parseInt(yet_join_lst[0].content.split("|")[1])
								}
								const yet_join = yet_join_lst.length;
								const join_send = () => {
									if (message.author_id != user.id && !yet_join)
										send(`##frien-join##:${message.content.substring(15)}|${user.id}`)
									if (yet_join && user.id != sender.id) {
										navigate(`/play/${message.content.substring(15)}?type=watch`);
									} else {
										navigate(`/play?friendly=${message.content.substring(15)}${user.id == sender.id ? "&is_creator=true" : ""}`);
									}
								}

								return (
									<div className='message-div' key={id}>
										<div className='match-message'>
											<div className='match-header'>
												<ImageBox is_you={user.id == sender.id} user={sender} onClick={() =>show_profile(sender.id.toString())} />
												<span className='message-sender-name'>{sender.name}{sender.id == user.id ? " ( you )" : ""} has created a game</span>
											</div>
											<Button onClick={join_send}>{user.id == sender.id || yet_id == user.id ? "Re join" : !yet_join ? "Join it" : "Watch game"}</Button>
										</div>
									</div>
								)
							}

							if (message.content.startsWith("##frien-join##:"))
								return null;

							return (
								<div className='message-div' key={id}>
									<ImageBox is_you={user.id == sender.id} user={sender} onClick={() =>show_profile(sender.id.toString())} />
									<div className='message-content'>
										<div className='message-header'>
											<span className='message-sender-name'>{sender.name}{sender.id == user.id ? " ( you )" : ""}</span>
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
				<RenderSend status={user_status} sendDirect={props.sendDirect} sendChannel={props.sendChannel} fetchSpecificDirect={props.fetchSpecificDirect} />
			</div>
		</div>
	)
}

export default connect(messagesStateToProps, mapDispatchToProps)(ConversationOpen);