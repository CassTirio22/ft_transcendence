import React, { useContext, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux';
import { mapDispatchToProps, mapStateToProps } from '../../../../store/dispatcher';
import "../style.scss"
import Checkbox from '@mui/material/Checkbox';
import { AuthContext, PopupContext, SocketContext, ToastContext } from '../../../..';
import { CHANNEL_LVL, generate_url, TOAST_LVL } from '../../../../constants/constants';
import { Button, TextField } from '@mui/material';
import axios from "../../../../service/axios"
import LockIcon from '@mui/icons-material/Lock';
import CreateBox from '../../../main/create_box/CreateBox';

type CreateChannel = {
	type: String,
	password: String,
	name: String
}

type ChannelFull = {
	members: any[]
}

type CreateProps = {
	messages?: any;
	fetchMessages?: any;
	selectConversation?: any;
	friends?: any;
	createDirect?: any;
	createChannel?: any;
	joinChannel?: any;
	setNewConversation?: any;
	newConversation?: any;
	submit?: any;
	cancel?: any;
}

const CreateChannelOrDirect = (props: CreateProps) => {

	const [toggle, setToggle] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [otherChannels, setOtherChannels] = useState<any[]>([]);
	const selected = useRef<number[]>([]);
	const selected_channel = useRef(-1);
	const {set_toast} = useContext(ToastContext);
	const new_channel = useRef<CreateChannel>({type: "", password: "", name: ""});
	const {user} = useContext(AuthContext);
	const {reload_socket} = useContext(SocketContext);

	const reset = () => {
		selected.current = [];
		selected_channel.current = -1;
		new_channel.current = {type: "", password: "", name: ""};
		setCurrentStep(0);
		props.setNewConversation("")		
	}

	const get_other_channels = async () => {
		const res = await axios.get("/channel/otherChannels")
		.then(e => e.data)
		.catch(e => null)
		if (res) {
			setOtherChannels(res);
		}
	}

	const submit = () => {
		if (props.newConversation == "direct") {
			if (!selected.current.length) {
				set_toast(TOAST_LVL.WARNING, "Selection needed", `Please select one friend to talk with`)
				return;
			}
			const id = selected.current[0]
			const exist = props.messages.direct.filter((elem: ChannelFull) => elem.members[0].id == id || elem.members[1].id == id)
			if (!exist.length) {
				props.createDirect(id).then((e: any) => {
					props.fetchMessages({user: user, channel_id: undefined, direct_id: e.payload});
					reload_socket();
				});
			} else {
				props.selectConversation({is_channel: false, id: exist[0].id});
			}
			reset()
		} else if (selected_channel.current == -1) {
			if (new_channel.current.type == "") {
				set_toast(TOAST_LVL.WARNING, "Selection needed", `Please select one kind of channel`)
				return;
			} else if (new_channel.current.name == "") {
				set_toast(TOAST_LVL.WARNING, "Name needed", `Please choose a name for your channel`)
				return;
			} else if (new_channel.current.type == "protected" && new_channel.current.password == "") {
				set_toast(TOAST_LVL.WARNING, "Password needed", `Please create a password for your protected channel`)
				return;
			} else if (new_channel.current.type == "protected" && new_channel.current.password.length < 6) {
				set_toast(TOAST_LVL.WARNING, "Stronger password needed", `Please use a password longer or equal than 6 characters`)
				return;
			}
			props.createChannel({
				status: new_channel.current.type,
				password: new_channel.current.password == "" ? undefined : new_channel.current.password,
				name: new_channel.current.name
			}).then((e: any) => {
				props.fetchMessages({user: user, channel_id: e.payload.id, direct_id: undefined});
				reload_socket();
			});
			reset()
		} else {
			props.joinChannel({
				channel: selected_channel.current,
				password: new_channel.current.password == "" ? "undefined" : new_channel.current.password
			}).then((e: any) => {
				if (e.error && new_channel.current.password != "") {
					set_toast(TOAST_LVL.WARNING, "Bad password", `You have to enter the correct password`)
				} else {
					props.fetchMessages({user: user, channel_id: selected_channel.current, direct_id: undefined});
					reload_socket();
					reset();
				}
			});
		}
	}

	useEffect(() => {
		get_other_channels();
	}, [])

	const CreateChannelInner = () => {

		const toggle_id = (id: number) => {
			if (props.newConversation == "direct") {
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

		if (props.newConversation == "direct") {
			return (
				<div className='create-conversation'>
					<h4>{"Select friend to talk in private"}</h4>
					<div className='friends-wrapper'>
						{
							props.friends.map((elem: any) => {
								return (
									<div key={elem.id} className="friend-elem">
										<div className='friend-picture-name'>
											<div className='image-div'>
												<img src={generate_url(elem)} />
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

		if (currentStep == 0) {
			return (
				<div className='new-create-channel'>
					<Button onClick={() => setCurrentStep(1)} fullWidth variant='outlined'>Create a new channel</Button>
					<Button onClick={() => setCurrentStep(10)} fullWidth variant='outlined'>Join an existing channel</Button>
				</div>
			)
		} else if (currentStep == 1) {

			const select_channel = (type: String) => {
				new_channel.current.type = type;
				setToggle(toggle => !toggle);
			}

			return (
				<div className='new-create-channel'>
					<h4>What kind of channel would you like to create?</h4>
					<Button onClick={() => {select_channel("public");setCurrentStep(2)}} fullWidth variant={new_channel.current.type == "public" ? "contained" : 'outlined'}>Public channel</Button>
					<Button onClick={() => {select_channel("protected");setCurrentStep(2)}} fullWidth variant={new_channel.current.type == "protected" ? "contained" : 'outlined'}>Protected channel</Button>
					<Button onClick={() => {select_channel("private");setCurrentStep(2)}} fullWidth variant={new_channel.current.type == "private" ? "contained" : 'outlined'}>Private channel</Button>
				</div>
			)
		} else if (currentStep == 2) {
			return (
				<div className='new-create-channel'>
					<h4>{new_channel.current.type !== "protected" ? "Setup a name for your channel" : "Setup a name and a password for your protected channel"}</h4>
					<form style={{width: "100%"}}>
						<TextField fullWidth onChange={(e) => {new_channel.current.name = e.target.value}} autoComplete='username' id="outlined" label="Name" variant="outlined" />
						{
							new_channel.current.type !== "protected" ? null:
							<TextField fullWidth onChange={(e) => {new_channel.current.password = e.target.value}} autoComplete='new-password' id="outlined-basic" label="Password" type="password" variant="outlined" />
						}
					</form>
				</div>
			)
		} else if (currentStep == 10) {

			return (
				<div className='new-create-channel'>
					{
						otherChannels.map((elem: any, id: number) => (
							<div className={`channel-elem ${elem.id == selected_channel.current ? "selected" : ""}`} onClick={() => {selected_channel.current = elem.id;setToggle(toggle => !toggle);if(elem.status == 1)setCurrentStep(11)}} key={id}>
								<span>{elem.name}</span>
								{
									elem.status ? <LockIcon/> : null
								}
							</div>
						))
					}
				</div>
			);
		} else if (currentStep == 11) {
			return (
				<div className='new-create-channel'>
					<h4>Enter the channel password</h4>
					<form style={{width: "100%"}}>
						<TextField fullWidth onChange={(e) => {new_channel.current.name = e.target.value}} autoComplete='username' id="outlined" label="Name" variant="outlined" sx={{display: "none"}} />
						<TextField fullWidth onChange={(e) => {new_channel.current.password = e.target.value}} autoComplete='new-password' id="outlined-basic" label="Password" type="password" variant="outlined" />
					</form>
				</div>
			)
		}
		return null;
	}

	return (
		<CreateBox visible={props.newConversation != ""} submit={submit} submitable={true} cancel={reset} submit_text="Next" title={props.newConversation == "direct" ? "New direct conversation" : "New channel"}>
			<CreateChannelInner/>
		</CreateBox>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateChannelOrDirect)