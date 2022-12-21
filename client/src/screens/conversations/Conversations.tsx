import React from 'react'
import { connect } from 'react-redux';
import ConversationList from '../../components/conversations/conversation_list/ConversationList'
import ConversationOpen from '../../components/conversations/conversation_open/ConversationOpen'
import { mapDispatchToProps, mapStateToProps } from '../../store/dispatcher';
import "./style.scss"

type Props = {
	messages?: any;
	fetchMessages?: any;
};

const Conversations: React.FC<Props> = (props: Props) => {
	return (
		<div className='conversations'>
			<ConversationList/>
			<ConversationOpen/>
		</div>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(Conversations)