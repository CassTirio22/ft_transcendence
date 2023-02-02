import { Button, Checkbox, Divider, TextField } from '@mui/material'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthContext, PopupContext, ToastContext } from '../../..'
import { mapDispatchToProps, mapStateToProps } from '../../../store/dispatcher'
import ImageBox from '../../main/image_box/ImageBox'
import Loading from '../../main/loading/Loading'
import "./style.scss"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Menu from '@mui/material/Menu';
import CreateBox from '../../main/create_box/CreateBox'
import { CHANNEL_LVL, CONV_LVL, generate_url, TOAST_LVL } from '../../../constants/constants'
import axios from "../../../service/axios"
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

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

type Mute = {
  id: number,
  type: string
}

type ChannelProps = {
  channel: any,
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
  const click_status = useRef(-1);
  const selected = useRef<number[]>([]);
  const [newMembers, setNewMembers] = useState(false);
  const [muteMember, setmuteMember] = useState("");
  const mute_ban_time = useRef("");
  const {set_toast} = useContext(ToastContext);


  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, id: number, level: number, status: number) => {
    click_id.current = id;
    click_lvl.current = level;
    click_status.current = status;
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

  const mute_ban = async () => {
    if (mute_ban_time.current == "") {
      set_toast(TOAST_LVL.WARNING, "Date needed", "You need to select a date to ban or mute an user");
      return;
    }
    const result = await axios.put("/member/status", {
      member: click_id.current,
      channel: parseInt(channel_id ? channel_id : "-1"),
      status: muteMember == "mute" ? click_status.current == 1 ? "regular" : "muted" : "banned",
      time: mute_ban_time.current + ":01+01:00"
    });
    props.fetchSpecificChannel(parseInt(channel_id ? channel_id : "-1"));
    setmuteMember("");
    mute_ban_time.current = "";
    selected.current = [];
  }

  const toggle_role = async () => {
    const result = await axios.put("/member/level", {
      member: click_id.current,
      channel: parseInt(channel_id ? channel_id : "-1"),
      level: click_lvl.current == CONV_LVL.ADMIN ? "regular" : "administrator"
    });
    props.fetchSpecificChannel(parseInt(channel_id ? channel_id : "-1"));
  }

  const give_ownership = async () => {
    const result = await axios.put("/member/level", {
      member: click_id.current,
      channel: parseInt(channel_id ? channel_id : "-1"),
      level: "owner"
    });
    const result2 = await axios.put("/member/level", {
      member: user.id,
      channel: parseInt(channel_id ? channel_id : "-1"),
      level: "administrator"
    });
    props.fetchSpecificChannel(parseInt(channel_id ? channel_id : "-1"));
  }

  const ChannelUpdate = (channel_props: ChannelProps) => {

    const [channelName, setChannelName] = useState(channel_props.channel.title);
    const [password, setPassword] = useState("");
    const [type, setType] = useState(channel_props.channel.status);

    const cancel = () => {
      setChannelName(channel_props.channel.title);
      setPassword("");
      setType(channel_props.channel.status);
    }

    const save_changes = async () => {
      if (type == CHANNEL_LVL.PROTECTED && password.length < 8) {
        set_toast(TOAST_LVL.WARNING, "Password needed", "Password for protected channel is needed and need to be at least 6 char long.");
        return;
      } else if (channelName == "") {
        set_toast(TOAST_LVL.WARNING, "Name needed", "Channel name cannot be empty");
        return;
      }
      const result = await axios.put("/channel/edit", {
        name: channelName,
        channel: parseInt(channel_id ? channel_id : "-1"),
        status: ["public", "protected", "private"][type],
        password: type == CHANNEL_LVL.PROTECTED ? password : null,
      });
      props.fetchMessages({user: user, channel_id: parseInt(channel_id ? channel_id : "-1"), direct_id: undefined});
    }

    return (
      <div className='admin-channel-update'>
        <div className='input-div'>
          <TextField fullWidth size='small' value={channelName} onChange={(e) => setChannelName(e.target.value)} label="Channel title" variant="outlined" />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Channel type</InputLabel>
            <Select
              size='small'
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={type}
              label="Channel type"
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value={0}>Public</MenuItem>
              <MenuItem value={1}>Protected</MenuItem>
              <MenuItem value={2}>Private</MenuItem>
            </Select>
          </FormControl>
          {
            type == CHANNEL_LVL.PROTECTED ? 
            <form>
              <TextField sx={{display: "none"}} type="text" autoComplete='username' label="Outlined" variant="outlined" />
              <TextField fullWidth size='small' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" type="password" label="Channel password" variant="outlined" />
            </form> : null
          }
        </div>
        <div className='save-cancel'>
          <Button onClick={cancel} variant="outlined">Cancel</Button>
          <Button onClick={save_changes} disabled={(password == "" || type == CHANNEL_LVL.PUBLIC) && type == channel_props.channel.status && channelName == channel_props.channel.title} variant="contained">Save changes</Button>
        </div>
      </div>
    )
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

  const leave = async (user_status: number, specific_channel: any) => {
    if (user_status == CONV_LVL.OWNER && specific_channel.members.length != 1) {
      set_toast(TOAST_LVL.ERROR, "Action needed", "You are the owner of this channel. Please select an other owner before leaving it.");
      return;
    }
    const ret = await axios.delete(`/member/quit/${channel_id}`)
      .then(e => e.data)
      .catch(e => null)
    set_toast(TOAST_LVL.SUCCESS, "Channel left", "You have left the channel.");
    navigate("/conversations")
    props.fetchMessages({user: user, channel_id: 0, direct_id: undefined});
  }

  if (!loaded) {
    return (
      <div id="channel-info" className='main-view'>
          <h1>Channel infos</h1>
          <Loading/>
      </div>
    )
  }

  let specific_channel_list = props.messages?.channels.filter((elem: any) => elem.id == parseInt(channel_id ? channel_id : "-1"));
  if (!specific_channel_list?.length) {
    navigate("/conversations");
    return null;
  }
  const specific_channel = specific_channel_list[0];
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
              <ChannelUpdate channel={specific_channel} />
               :
              <div className='non-admin-channel-info'>
                <span>{specific_channel.title}</span>
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
                  <MoreHorizIcon onClick={(e: any) => handleClick(e, elem.id, elem.level, elem.status)} />
                </div>
              )
            })
          }
          </div>
        </div>
        <Button onClick={() => leave(user_status, specific_channel)} variant='outlined' color={'error'} >Leave</Button>
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
            click_id.current != user.id && user_status == CONV_LVL.OWNER ? <MenuItem onClick={() => {give_ownership();handleClose()}}>Give ownership</MenuItem> : null
          }
          {
            click_id.current != user.id && click_lvl.current != CONV_LVL.OWNER && (user_status == CONV_LVL.ADMIN || user_status == CONV_LVL.OWNER) ? 
            <MenuItem onClick={() => {toggle_role();handleClose()}}>
              {click_lvl.current == CONV_LVL.ADMIN ? "Make user" : "Make admin"}
            </MenuItem> : null
          }
          {
            click_id.current != user.id && click_status.current != CONV_LVL.OWNER ? <Divider /> : null
          }
          {
            click_id.current != user.id && click_lvl.current != CONV_LVL.OWNER && (user_status == CONV_LVL.ADMIN || user_status == CONV_LVL.OWNER) ? 
            <MenuItem onClick={() => {setmuteMember("mute");handleClose()}}>{click_status.current == 1 ? "Unmute" : "Mute" }</MenuItem> : null
          }
          {
            click_id.current != user.id && click_lvl.current != CONV_LVL.OWNER && (user_status == CONV_LVL.ADMIN || user_status == CONV_LVL.OWNER) ? 
            <MenuItem onClick={() => {setmuteMember("ban");handleClose()}}>{click_status.current == 2 ? "Unban" : "Ban" }</MenuItem> : null
          }
        </Menu>
        <CreateBox visible={newMembers} submit={submit} submitable={true} cancel={() => {setNewMembers(false)}} submit_text="Add" title="Add members to this channel">
          <AddMembers members={specific_channel.members}/>
        </CreateBox>
        <CreateBox visible={muteMember != ""} submit={mute_ban} submitable={true} cancel={() => {setmuteMember("")}} submit_text={muteMember == "mute" ? "Mute" : "Ban"} title={muteMember == "mute" ? "Mute member" : "Ban member"}>
          <div className='mute-div'>
            <h4>You can {muteMember == "mute" ? "mute" : "ban"} users only for a limited time {"(which can be realy long, don't worry)"}.</h4>
            <input onChange={(e) => mute_ban_time.current = e.target.value} type="datetime-local" />
          </div>
        </CreateBox>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelInfo)