
import React, { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../..';

const Oauth = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const {user, profile} = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            if (searchParams.get("type") == "register") {
                profile(token).then(() => navigate("/me/profile"));
            } else {
                profile(token).then(() => navigate("/"));
            }
        }
    }, [])
    
    return (
        <div>Oauth</div>
    )
}

export default Oauth