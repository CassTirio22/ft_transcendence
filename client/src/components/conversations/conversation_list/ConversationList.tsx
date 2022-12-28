import React from 'react'
import { connect } from 'react-redux';
import { mapDispatchToProps, mapStateToProps } from '../../../store/dispatcher';
import "./style.scss"


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
  return (
    <div className='conversation-list'>
        <h3>Canaux</h3>
        {
            props.messages.channels.map((elem: Channel, id: number) => (
                <div onClick={() => props.selectConversation({is_channel: true, id: elem.id})} key={id} className={`conversation-elem${props.messages.current.id == elem.id && props.messages.current.is_channel ? " active" : ""}`}>
                    <span>{elem.title}</span>
                </div>
            ))
        }
        <h3>Messages directs</h3>
        {
            props.messages.direct.map((elem: Direct, id: number) => (
                <div onClick={() => props.selectConversation({is_channel: false, id: elem.id})} key={id} className={`conversation-elem${props.messages.current.id == elem.id && !props.messages.current.is_channel ? " active" : ""}`}>
                    <span>{elem.title}</span>
                </div>
            ))
        }
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ConversationList);