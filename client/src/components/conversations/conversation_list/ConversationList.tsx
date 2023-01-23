import React, { useState } from 'react'
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { mapDispatchToProps, mapStateToProps } from '../../../store/dispatcher';
import AddIcon from '@mui/icons-material/Add';
import "./style.scss"
import CreateBox from '../../main/create_box/CreateBox';


type Props = {
	messages?: any;
	fetchMessages?: any;
	selectConversation?: any;
};

type Channel = {
	id: number,
	title: string,
}

type Direct = {
	id: number,
	title: string,
}


const ConversationList: React.FC<Props> = (props: Props) => {

	const [newConversation, setNewConversation] = useState("");

	const navigate = useNavigate();

	const redirect_set_conv = (is_channel: boolean, id: number) => {
		props.selectConversation({is_channel: is_channel, id: id});
		navigate(`/conversations/${is_channel ? "channel" : "direct"}/${id}`);
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
			<CreateBox visible={newConversation != ""} cancel={() => setNewConversation("")} submit_text="Create" title={newConversation == "direct" ? "New direct conversation" : "New channel"}>
				<div>
					<p>coucou</p>
				</div>
			</CreateBox>
		</div>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(ConversationList);