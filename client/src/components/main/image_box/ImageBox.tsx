
import React from 'react'
import { connect } from 'react-redux'
import { friendsStateToProps, mapStateToProps } from '../../../store/dispatcher'
import "./style.scss"

type Props = {
    user?: any,
    onClick?: any,
    friends?:any,
    is_you?: boolean,
}

const ImageBox = (props: Props) => {
    let status = props.friends.filter((elem: any) => elem.id == props.user.id);
    if (status.length) {
        if (!status[0].status)
            status = "connected"
        else
            status = "disconnected"
    } else {
        status = "unknown"
    }
    if (props.is_you)
        status = "connected"

    return (
        <div profile-id={props.user.id} onClick={props.onClick} className={`message-sender-image-container ${status}`}>
            <img src={`https://avatars.dicebear.com/api/adventurer/${props.user.name}.svg`} />
        </div>
    )
}

export default connect(friendsStateToProps, null)(ImageBox)