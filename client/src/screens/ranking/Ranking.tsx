import React, { useContext, useEffect, useState } from 'react'
import "./style.scss"
import axios from "../../service/axios"
import { PopupContext } from '../..';
import StarsIcon from '@mui/icons-material/Stars';

const Ranking = () => {
  const {show_profile} = useContext(PopupContext);
  const [ranking, setRanking] = useState<any[]>([]);

  const get_ranking = async () => {
    const result = await axios.get("/user/ladder")
      .then(e => e.data)
      .catch(e => null)
    if (result)
      setRanking(result.reverse());
  }

  useEffect(() => {
    get_ranking();
  }, [])
  

  return (
    <div className='main-view' id="ranking">
      <h1>
        Ranking
      </h1>
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th className='large'>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {
            ranking.map((elem: any, id: number) => (
              <tr key={id}>
                <td><div className='ranking'>{id + 1} {id < 3 ? <StarsIcon className={"abc"[id]} /> : null}</div></td>
                <td>
                    <div onClick={() => show_profile(elem.id)} className='friend-picture-name'>
                      <div className='image-div'><img src={`https://avatars.dicebear.com/api/adventurer/${elem.name}.svg`} /></div>
                      <span>{elem.name}</span>
                    </div>
                </td>
                <td>{elem.score}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export default Ranking