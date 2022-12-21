
import { Menu, MenuItem } from '@mui/material';
import React, { createRef, useEffect, useRef } from 'react'
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
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
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
  return (
    <div className='current-conversation'>
      <div className='conversation-header'>
        <div>
          <span>{current_conversation.title}</span>
        </div>
      </div>
      <div ref={scroll_view} className='conversation-body'>
        {
          [...current_conversation.messages, ...current_conversation.messages, ...current_conversation.messages].map((message: Message, id: number) => {
            const sender: User = current_conversation.members.filter((mem: User) => mem.id == message.sender)[0];
            const created_at = new Date(message.created_at);
            return (
              <div className='message-div' key={id}>
                <div onClick={handleClick} className='message-sender-image-container'>
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
        <Menu
					id="basic-menu"
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					MenuListProps={{
					'aria-labelledby': 'basic-button',
					}}
				>
					<MenuItem onClick={() => {console.log("first");handleClose()}}>Voir le profil</MenuItem>
          <MenuItem onClick={() => {console.log("first");handleClose()}}>Parler en priver</MenuItem>
          <MenuItem onClick={() => {console.log("first");handleClose()}}>Bloquer l'utilisateur</MenuItem>
				</Menu>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ConversationOpen);