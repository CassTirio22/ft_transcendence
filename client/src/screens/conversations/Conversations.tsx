import React, { useContext, useEffect, useRef } from 'react'
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { AuthContext, PopupContext } from '../..';
import ConversationList from '../../components/conversations/conversation_list/ConversationList'
import ConversationOpen from '../../components/conversations/conversation_open/ConversationOpen'
import { mapDispatchToProps, mapStateToProps } from '../../store/dispatcher';
import "./style.scss"

type Props = {
	messages?: any;
	fetchMessages?: any;
	friends?: any;
	selectConversation?: any;
};

const Conversations: React.FC<Props> = (props: Props) => {

	const {user} = useContext(AuthContext);
	const loaded = useRef(false);
	let { channel_id, direct_id } = useParams();

	useEffect(() => {
		if (props.friends.length && !loaded.current) {
			props.fetchMessages({user: user, channel_id: channel_id, direct_id: direct_id});
			loaded.current = true;
		}
	}, [props.friends])
	

	return (
		<div className='conversations'>
			<ConversationList/>
			<ConversationOpen/>
		</div>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(Conversations)