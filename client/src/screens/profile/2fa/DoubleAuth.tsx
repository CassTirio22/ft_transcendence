import { Button, TextField } from '@mui/material'
import React, { useContext, useState } from 'react'
import { AuthContext, ToastContext } from '../../..';
import { TOAST_LVL } from '../../../constants/constants';
import "./style.scss"
import axios from "../../../service/axios"
import { useNavigate } from 'react-router-dom';

const DoubleAuth = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSend, setIsSend] = useState(false);
    const [verifactionCode, setVerifactionCode] = useState("");
    const {set_toast} = useContext(ToastContext);
    const {profile, user} = useContext(AuthContext);
    const navigate = useNavigate();

    const use_phone = async () => {
        const ret = await axios.post("/auth/2fa", {
            activate: true,
            phone: phoneNumber
        })
        .then(e => e.data)
        .catch(e => null)
        if (ret && ret != "bad") {
            set_toast(TOAST_LVL.SUCCESS, "Sms sended", `A verification code has been send to ${phoneNumber}`);
            setPhoneNumber(ret);
            setIsSend(true);
        } else {
            setPhoneNumber("");
            set_toast(TOAST_LVL.ERROR, "Invalid", `${phoneNumber} is not a valid phone number.`);
        }
    }

    const send_code = async () => {
        const ret = await axios.post("/auth/2fa", {
            activate: true,
            phone: phoneNumber,
            code: verifactionCode
        })
        .then(e => e.data)
        .catch(e => null)
        if (ret && ret != "bad") {
            set_toast(TOAST_LVL.SUCCESS, "2fa activated", `The 2fa is activated on your account`);
            profile(user.token).then(() => {
                navigate("/me/profile");
            })
        } else {
            setVerifactionCode("");
            set_toast(TOAST_LVL.ERROR, "Invalid", `The authentication code is invalid.`);
        }
    }

    if (isSend) {
        return (
            <div id="double-auth" className='main-view'>
                <h1>2fa activation</h1>
                <p>In order to activate 2fa on your account you have to write the verification code bellow.</p>
                <div className='phone-div'>
                    <TextField size='small' label="Verification code" value={verifactionCode} onChange={(e) => setVerifactionCode(e.target.value)} />
                    <Button onClick={send_code} variant='contained' disabled={verifactionCode.length != 6}>Activate 2fa</Button>
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