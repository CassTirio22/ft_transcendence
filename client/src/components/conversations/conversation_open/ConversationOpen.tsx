
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
  messages: Message[],
  members: User[]
}

type Message = {
  created_at: string,
  sender: number,
  content: string
}

type User = {
  id: number,
  full_name: string,
  image_path: string
}

const ConversationOpen: React.FC<Props> = (props: Props) => {

  if (props.messages.current.id == -1) {
    return null;
  }

  let current_conversation: Channel = {} as Channel;

  if (props.messages.current.is_channel) {
    current_conversation = props.messages.channels.filter((elem: Channel) => elem.id == props.messages.current.id)[0];
  } else {
    current_conversation = props.messages.direct.filter((elem: Channel) => elem.id == props.messages.current.id)[0];
  }

  return (
    <div className='current-conversation'>
      <div className='conversation-header'>
        <div>
          <span>{current_conversation.title}</span>
        </div>
      </div>
      <div className='conversation-body'>
        {
          current_conversation.messages.map((message: Message, id: number) => {
            const sender: User = current_conversation.members.filter((mem: User) => mem.id == message.sender)[0];
            const created_at = new Date(message.created_at);
            return (
              <div className='message-div' key={id}>
                <div className='message-sender-image-container'>
                  <img src={`https://avatars.dicebear.com/api/adventurer/${sender.image_path}.svg`} />
                </div>
                <div className='message-content'>
                  <div className='message-header'>
                    <span className='message-sender-name'>{sender.full_name}</span>
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
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ConversationOpen);