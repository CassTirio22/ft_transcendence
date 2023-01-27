import { Button, Checkbox } from '@mui/material'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthContext, PopupContext } from '../../..'
import { mapDispatchToProps, mapStateToProps } from '../../../store/dispatcher'
import ImageBox from '../../main/image_box/ImageBox'
import Loading from '../../main/loading/Loading'
import "./style.scss"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CreateBox from '../../main/create_box/CreateBox'
import { CONV_LVL } from '../../../constants/constants'

type Props = {
  messages?: {
    channels: any[],
  },
  fetchSpecificChannel?: any,
  fetchMessages?:any,
  friends?:any,
  addMember?:any,
}

type AlreadyMember = {
  members: any[]
}

const ChannelInfo = (props: Props) => {
  let { channel_id } = useParams();
  const {user} = useContext(AuthContext);
  const [loaded, setLoaded] = useState(false);
  const {show_profile} = useContext(PopupContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const click_id = useRef(-1);
  const click_lvl = useRef(-1);
  const selected = useRef<number[]>([]);
  const [newMembers, setNewMembers] = useState(false);


  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, id: number, level: number) => {
    click_id.current = id;
    click_lvl.current = level;
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (channel_id != undefined) {
      const specific_channel = props.messages?.channels.filter((elem: any) => elem.id == parseInt(channel_id ? channel_id : "-1"));
      if (specific_channel && !specific_channel.length) {
        props.fetchMessages({user: user, channel_id: parseInt(channel_id ? channel_id : "-1"), direct_id: undefined}).then((e: any) => {setLoaded(true)})
      } else if (specific_channel?.length) {
        setLoaded(true);
      }
    }
  }, [])

  const submit = async () => {
    for (let index = 0; index < selected.current.length; index++) {
      const element: number = selected.current[index];
      await props.addMember({member: element, channel: parseInt(channel_id ? channel_id : "-1")});
    }
    props.fetchMessages({user: user, channel_id: parseInt(channel_id ? channel_id : "-1"), direct_id: undefined}).then((e: any) => {setLoaded(true)});
    setNewMembers(false);
    selected.current = [];
  }

  const toggle_role = () => {

  }

  const AddMembers = (memb: AlreadyMember) => {

    const [toggle, setToggle] = useState(false);

    const toggle_id = (id: number) => {
			if (selected.current.includes(id)) {
        selected.current.splice(selected.current.indexOf(id), 1)
      } else {
        selected.current.push(id)
      }
			setToggle(!toggle);
		}

    
    return (
      <div className='create-conversation'>
        <h4>{"Select friend to add to this channel"}</h4>
        <div className='friends-wrapper'>
          {
            props.friends?.map((elem: any) => {
              if (memb.members.filter((e: any) => e.id == elem.id).length) {
                return null;
              }
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

  if (!loaded) {
    return (
      <div id="channel-info" className='main-view'>
          <h1>Channel infos</h1>
          <Loading/>
      </div>
    )
  }

  const specific_channel = props.messages?.channels.filter((elem: any) => elem.id == parseInt(channel_id ? channel_id : "-1"))[0];
  const user_status = specific_channel.members.filter((elem: any) => elem.id == user.id)[0].level;

  return (
    <div id="channel-info" className='main-view'>
        <h1>Channel infos</h1>
        <div className='channel-setting-div'>
          <div className='channel-setting-header'>
            <h2>Channel</h2>
          </div>
          <div className='channel-setting-body'>
            {
              user_status == CONV_LVL.OWNER ?
              <div>

              </div> :
              <div>
                
              </div>
            }
          </div>
        </div>
        <div className='channel-setting-div'>
          <div className='channel-setting-header'>
            <h2>Members</h2>
            <Button onClick={() => setNewMembers(true)}>Add members</Button>
          </div>
          <div className='friend-wrapper'>
          {
            specific_channel?.members.map((elem: any, id: number) => {
              return (
                <div className='friend-elem' key={id}>
                  <div className='friend-picture-name'>
                    <ImageBox onClick={() => show_profile(elem.id)} user={elem} is_you={elem.id == user.id} />
                    <div className="name-level">
                      <span>{elem.name} {elem.id == user.id ? "(you)" : ""}</span>
                      <span>{elem.level == CONV_LVL.ADMIN ? "admin" : elem.level == CONV_LVL.OWNER ? "owner" : ""}</span>
                    </div>
                  </div>
                  <MoreHorizIcon onClick={(e: any) => handleClick(e, elem.id, elem.level)} />
                </div>
              )
            })
          }
          </div>
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
          <MenuItem onClick={() => {show_profile(click_id.current.toString());handleClose()}}>Profile</MenuItem>
          {
            click_id.current == user.id ? <MenuItem onClick={() => {navigate("/me/profile");handleClose()}}>Edit profile</MenuItem> : null
          }
          {
            click_id.current != user.id && user_status == CONV_LVL.OWNER ? <MenuItem onClick={() => {handleClose()}}>Give ownership</MenuItem> : null
          }
          {
            click_id.current != user.id && click_lvl.current != CONV_LVL.OWNER && (user_status == CONV_LVL.ADMIN || user_status == CONV_LVL.OWNER) ? 
            <MenuItem onClick={() => {toggle_role();handleClose()}}>
              {click_lvl.current == CONV_LVL.ADMIN ? "Make user" : "Make admin"}
            </MenuItem> : null
          }
        </Menu>
        <CreateBox visible={newMembers} submit={submit} submitable={true} cancel={() => {setNewMembers(false)}} submit_text="Add" title="Add members to this channel">
          <AddMembers members={specific_channel.members}/>
        </CreateBox>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelInfo)