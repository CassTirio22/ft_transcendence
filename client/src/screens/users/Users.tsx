import React, { useEffect, useState } from 'react'
import Loading from '../../components/main/loading/Loading';
import "./style.scss"
import axios from "../../service/axios"
import { useParams } from 'react-router-dom';

const Users = () => {

  const [user, setUser] = useState<any | null>(null);
  const {player_id} = useParams();


  const get_user = async () => {
    const ret = await axios.get(`/user/other/${player_id}`)
    .then(e => e.data)
    .catch(e => {console.log(e);return null})
    if (ret) {
      ret.won.forEach((element: any) => {
        element.is_won = true;
      });
      ret.lost.forEach((element: any) => {
        element.is_won = false;
      });
      const new_user = {...ret, games: [...ret.won, ...ret.lost].sort((a: any, b: any) => a.date - b.date)}
      console.log(new_user)
      setUser(new_user);
    }
  }

  useEffect(() => {
    get_user();
  }, [])
  

  if (!user)
    return <Loading/>

  return (
    <div className='main-view'>
      <h1>{user.name}</h1>
    </div>
  )
}

export default Users