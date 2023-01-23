import React, { useContext } from 'react'
import { connect } from 'react-redux';
import { mapDispatchToProps, mapStateToProps } from '../../store/dispatcher';
import "./style.scss"
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { PopupContext } from '../..';

type Props = {
	friends?: any
};


const Friends = (props: Props) => {
  const {show_profile} = useContext(PopupContext);

  return (
    <div id="friends">
        <h1>My friends</h1>
			  <p>Manage your friend list and create new relations</p>
        <ul className='friends-wrapper'>
          {
            props.friends?.length ?
            props.friends.map((elem: any, id: number) => {
              return (
                <li className='friend-elem' key={id}>
                  <div className='friend-picture-name'>
                    <div className='image-div'><img src={`https://avatars.dicebear.com/api/adventurer/${elem.name}.svg`} /></div>
                    <span>{elem.name}</span>
                  </div>
                  <div className='friend-more'>
                    <div className='friend-score'>{elem.score}</div>
                    <MoreVertIcon onClick={() => show_profile(elem.id)} />
                  </div>
                </li>
              )
            }) : null
          }
        </ul>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Friends)