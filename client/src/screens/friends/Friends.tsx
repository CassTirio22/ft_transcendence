import React, { useContext, useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { friendGameStateToProps, friendsStateToProps, mapDispatchToProps, mapStateToProps } from '../../store/dispatcher';
import "./style.scss"
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { PopupContext, SocketContext, ToastContext } from '../..';
import axios from "../../service/axios"
import { Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { generate_url, TOAST_LVL } from '../../constants/constants';
import ImageBox from '../../components/main/image_box/ImageBox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import CachedIcon from '@mui/icons-material/Cached';

type Props = {
	friends?: any,
  newFriendRequest?: any,
  acceptFriendRequest?: any,
  removeFriendRequest?: any,
  fetchFriends?: any,
  watch?: any,
  fetchWatch?: any
};

type Others = {
  asked: any[],
  askers: any[],
  nonFriends: any[],
}

let timout: any | null = null;
let click_outside = true;

const Friends = (props: Props) => {
  const {show_profile, open_confirm} = useContext(PopupContext);
  const [others, setOthers] = useState<Others | null>(null);
  const [search, setSearch] = useState<any[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const {set_toast} = useContext(ToastContext);
  const navigate = useNavigate();
  const {reload_socket} = useContext(SocketContext);

  const setup_lists = async () => {
      const lists = await axios.get("friendship/others")
      .then(e => e.data)
      .catch(e => null)
      setOthers(lists);
  }

  const real_search = (input: String) => {
    if (input == "") {
      setSearch([])
      return;
    }
    const ok: any[] = [];
    others?.nonFriends.forEach(elem => {
      if (elem.name.includes(input)) {
        ok.push(elem)
      }
    })
    setSearch(ok)
  }

  const send_request = async (id: number, name: String) => {
    props.newFriendRequest(id).then(async (e: any) => {
      set_toast(TOAST_LVL.SUCCESS, "Request successfuly sended", `A new friend request has been send to ${name}`)
      await setup_lists();
      setSearch([]);
      setOpenSearch(false);
    })
  }

  const time_search = (input: String) => {
    clearTimeout(timout);
    timout = setTimeout(() => {
      real_search(input)
    }, 300);
  }

  const handle_request = (didAccept: Boolean, id: number, name: String) => {
    if (didAccept) {
      props.acceptFriendRequest(id).then(async (e: any) => {
        set_toast(TOAST_LVL.SUCCESS, "Request accepted", `${name} and you are friend. You can now talk in private together.`)
        await setup_lists();
        props.fetchFriends();
      })
    } else {
      props.removeFriendRequest(id).then(async (e: any) => {
        set_toast(TOAST_LVL.SUCCESS, "Request rejected", `The friend request of ${name} has been removed.`)
        await setup_lists();
        props.fetchFriends();
      })
    }
  }

  useEffect(() => {
    props.fetchWatch();
		const inter = setInterval(() => props.fetchWatch(), 10000);
    setup_lists();
    return () => {
			clearInterval(inter);
		}
  }, [])
  
  const fetch_friends = async () => {
    set_toast(TOAST_LVL.SUCCESS, "Success", `You are up to date`)
    await props.fetchFriends();
    await props.fetchWatch();
    setup_lists();
    reload_socket();
  }

  return (
    <div id="friends" className='main-view'>
        <div className='friends-header'>
          <div className='header-title'>
            <div className='title-recycle'>
              <h1>My friends</h1>
              <CachedIcon onClick={() => fetch_friends()} />
            </div>
            <p>Manage your friend list and create new relations</p>
          </div>
          <SearchIcon onClick={() => setOpenSearch(true)}/>
        </div>
        {
          others == null || !others.asked.length ? null :
          <ul className='friends-wrapper'>
            <li className='title-list'>
              <h2>Pending requests</h2>
            </li>
            {
              others.asked.map((elem: any, id: number) => {
                return (
                  <li className='friend-elem' key={id}>
                    <div className='friend-picture-name'>
                      <ImageBox onClick={() => show_profile(elem.id)} user={elem} />
                      <span>{elem.name}</span>
                    </div>
                  </li>
                )
              })
            }
          </ul>
        }
        {
          others == null || !others.askers.length ? null :
          <ul className='friends-wrapper'>
            <li className='title-list'>
              <h2>Friends requests</h2>
            </li>
            {
              others.askers.map((elem: any, id: number) => {
                return (
                  <li className='friend-elem' key={id}>
                    <div className='friend-picture-name'>
                      <ImageBox onClick={() => show_profile(elem.id)} user={elem} />
                      <span>{elem.name}</span>
                    </div>
                    <div className='accept-buttons'>
                      <Button onClick={() => handle_request(true, elem.id, elem.name)} variant="contained">Confirm</Button>
                      <Button onClick={() => open_confirm("Reject friend request", "Are you sure you want to reject this friend request?", undefined, () => handle_request(false, elem.id, elem.name))} variant="outlined">Remove</Button>
                    </div>
                  </li>
                )
              })
            }
          </ul>
        }
        {
          !props.friends.length ? null :
          <ul className='friends-wrapper'>
            <li className='title-list'>
              <h2>Friends</h2>
            </li>
            {
              props.friends.map((elem: any, id: number) => {
                const game = props.watch.watch.filter((el: any) => el.winner_id == elem.id || el.loser_id == elem.id);
                return (
                  <li className='friend-elem' key={id}>
                    <div className='friend-picture-name'>
                      <ImageBox onClick={() => show_profile(elem.id)} user={elem} />
                      <span>{elem.name}</span>
                      {
                        !game?.length ? null :
                        <VisibilityIcon onClick={() => navigate(`/play/${game[0].address}?type=watch`)} />
                      }
                    </div>
                    <div className='friend-more'>
                      <div className='friend-score'>{elem.score}</div>
                      <MoreVertIcon onClick={() => show_profile(elem.id)} />
                    </div>
                  </li>
                )
              })
            }
          </ul>
        }
        {
          !props.friends.length && !others?.askers.length && !others?.asked.length ?
          <div>
            <h2>
              Start a better Pong experience by adding some friends!
            </h2>
            <p>You can send friend request by clicking on the search button above.</p>
          </div>
          : null
        }
        {
          !openSearch ? null :
          <div onClick={() => {if(click_outside){setSearch([]);setOpenSearch(false);};click_outside=true;}} className='search-div'>
            <div onClick={() => click_outside=false} className='center-search'>
              <div className='search-input'>
                <input autoFocus onChange={(e) => time_search(e.target.value)} placeholder='Search for friends' />
              </div>
              <div className='wrapper'>
                {
                  search.map((elem: any, id: number) => {
                    return (
                      <div className='friend-request-div' key={id}>
                        <div className='friend-picture-name'>
                          <div className='image-div'><img src={generate_url(elem)} /></div>
                          <span>{elem.name}</span>
                        </div>
                        <Button onClick={() => send_request(elem.id, elem.name)} variant='outlined'>Send request</Button>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>
        }
    </div>
  )
}

export default connect(friendGameStateToProps, mapDispatchToProps)(Friends)