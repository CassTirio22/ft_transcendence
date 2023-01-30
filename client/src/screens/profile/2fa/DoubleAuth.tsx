import { Button, TextField } from '@mui/material'
import React, { useContext, useState } from 'react'
import { ToastContext } from '../../..';
import { TOAST_LVL } from '../../../constants/constants';
import "./style.scss"

const DoubleAuth = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSend, setIsSend] = useState(false);
    const [verifactionCode, setVerifactionCode] = useState("");
    const {set_toast} = useContext(ToastContext);

    const use_phone = () => {
        set_toast(TOAST_LVL.SUCCESS, "Sms sended", `A verification code has been send to ${phoneNumber}`);
        setIsSend(true);
    }

    if (isSend) {
        return (
            <div id="double-auth" className='main-view'>
                <h1>2fa activation</h1>
                <p>In order to activate 2fa on your account you have to write the verification code bellow.</p>
                <div className='phone-div'>
                    <TextField size='small' label="Verification code" value={verifactionCode} onChange={(e) => setVerifactionCode(e.target.value)} />
                    <Button onClick={use_phone} variant='contained' disabled={phoneNumber.length < 6}>Activate 2fa</Button>
                </div>
            </div>
        )
    }

    return (
        <div id="double-auth" className='main-view'>
            <h1>2fa activation</h1>
            <p>In order to active 2fa on your account you have to enter your phone number. A verificaiton sms will be send to this number.</p>
            <div className='phone-div'>
                <TextField type={"tel"} size='small' label="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                <Button onClick={use_phone} variant='contained' disabled={phoneNumber.length < 6}>Use this number</Button>
            </div>
        </div>
    )
}

export default DoubleAuth