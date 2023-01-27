import { Button } from '@mui/material'
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

type Props = {
  messages?: {
    channels: any[],
  },
  fetchSpecificChannel?: any,
  fetchMessages?:any,
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
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
    click_id.current = id;
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (channel_id != undefined) {
      const specific_channel = props.messages?.channels.filter((elem: any) => elem.id == parseInt(channel_id ? channel_id : "-1"));
      if (specific_channel && !specific_channel.length) {
        props.fetchMessages({user: user, channel_id: undefined, direct_id: parseInt(channel_id ? channel_id : "-1")}).then((e: any) => {})
      } else if (specific_channel?.length) {
        setLoaded(true);
      }
    }
  }, [])

  if (!loaded) {
    return (
      <div id="channel-info" className='main-view'>
          <h1>Channel infos</h1>
          <Loading/>
      </div>
    )
  }

  const specific_channel = props.messages?.channels.filter((elem: any) => elem.id == parseInt(channel_id ? channel_id : "-1"))[0];

  return (
    <div id="channel-info" className='main-view'>
        <h1>Channel infos</h1>
        <div className='channel-setting-div'>
          <div className='channel-setting-header'>
            <h2>Members</h2>
            <Button>Add members</Button>
          </div>
          <div className='friend-wrapper'>
          {
            specific_channel?.members.map((elem: any, id: number) => {
              return (
                <div className='friend-elem' key={id}>
                  <div className='friend-picture-name'>
                    <ImageBox onClick={() => show_profile(elem.id)} user={elem} is_you={elem.id == user.id} />
                    <div>
                      <span>{elem.name} {elem.id == user.id ? "(you)" : ""}</span>
                    </div>
                  </div>
                  <MoreHorizIcon onClick={(e: any) => handleClick(e, elem.id)} />
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
      </Menu>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelInfo)