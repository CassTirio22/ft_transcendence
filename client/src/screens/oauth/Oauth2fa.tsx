import { Button, TextField } from '@mui/material';
import axios from '../../service/axios';
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../..';
import "./style.scss"

const Oauth2fa = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const {user, profile} = useContext(AuthContext);
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [twoFa, settwoFa] = useState("");

    const send_code = async () => {
        const tk = await axios.post("/auth/login-2fa-oauth", {
            code: twoFa,
            token: token
        })
        .then(e => e.data)
        .catch(e => null)
        if (tk) {
            profile(tk).then(() => navigate("/"));
        }
    }
    
    return (
        <div id="oauth-2fa">
            <div className='center-div'>
                <TextField size='small' value={twoFa} onChange={(e) => settwoFa(e.target.value)} label="Confirmation code" />
				<Button variant='contained' disabled={twoFa.length < 6} onClick={send_code} >Sign in</Button>
            </div>
        </div>
    )
}

export default Oauth2fa