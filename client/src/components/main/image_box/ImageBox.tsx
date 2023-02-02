
import React from 'react'
import { connect } from 'react-redux'
import { base_url, generate_url } from '../../../constants/constants'
import { friendsStateToProps, mapStateToProps } from '../../../store/dispatcher'
import "./style.scss"

type Props = {
    user?: any,
    onClick?: any,
    friends?:any,
    is_you?: boolean,
    blocked?: any,
    need_margin?: boolean,
}

const ImageBox = (props: Props) => {
    let status = props.friends.filter((elem: any) => elem.id == props.user.id);
    if (status.length) {
        if (status[0].status == 2)
            status = "in-game"
        else if (!status[0].status)
            status = "connected"
        else
            status = "disconnected"
    } else {
        status = "unknown"
    }
    if (props.is_you)
        status = "connected"
    
    if (props.blocked.filter((elem: any) => elem.id == props.user.id).length) {
        status = "blocked"
    }

    return (
        <div style={props.need_margin == false ? {margin: 0} : {}} profile-id={props.user.id} onClick={props.onClick} className={`message-sender-image-container ${status}`}>
            <img src={generate_url(props.user)} />
        </div>
    )
}

export default connect(friendsStateToProps, null)(ImageBox)