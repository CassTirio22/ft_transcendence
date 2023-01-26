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
import { Button, TextField } from '@mui/material';


type Props = {
	messages?: any;
	fetchMessages?: any;
	selectConversation?: any;
	friends?: any;
	createDirect?: any;
	createChannel?: any;
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

type CreateChannel = {
	type: String,
	password: String,
	name: String
}


const ConversationList: React.FC<Props> = (props: Props) => {

	const [newConversation, setNewConversation] = useState("");
	const {user} = useContext(AuthContext);
	const selected = useRef<number[]>([]);
	const new_channel = useRef<CreateChannel>({type: "", password: "", name: ""});
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
		} else {
			if (new_channel.current.type == "") {
				set_toast(TOAST_LVL.WARNING, "Selection needed", `Please select one kind of channel`)
				return;
			} else if (new_channel.current.name == "") {
				set_toast(TOAST_LVL.WARNING, "Name needed", `Please choose a name for your channel`)
				return;
			} else if (new_channel.current.type == "protected" && new_channel.current.password == "") {
				set_toast(TOAST_LVL.WARNING, "Password needed", `Please create a password for your protected channel`)
				return;
			}
			props.createChannel({
				status: new_channel.current.type,
				password: new_channel.current.password == "" ? undefined : new_channel.current.password,
				name: new_channel.current.name
			}).then((e: any) => {
				props.fetchMessages({user: user, channel_id: e.payload.id, direct_id: undefined});
			});
			new_channel.current = {type: "", password: "", name: ""};
			setNewConversation("");
		}
	}

	const CreateChannelOrDirect = () => {

		const [toggle, setToggle] = useState(false);
		const [currentStep, setCurrentStep] = useState(0);

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

		if (newConversation == "direct") {
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

		if (currentStep == 0) {
			return (
				<div className='new-create-channel'>
					<Button onClick={() => setCurrentStep(1)} fullWidth variant='outlined'>Create a new channel</Button>
					<Button fullWidth variant='outlined'>Join an existing channel</Button>
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
		}

		return null;
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
			<div onClick={() => {props.friends.length ? setNewConversation("direct") : navigate("/friends")}} className='add-box'>
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