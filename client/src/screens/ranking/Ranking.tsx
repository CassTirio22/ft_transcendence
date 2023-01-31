import React, { useContext, useEffect, useState } from 'react'
import "./style.scss"
import axios from "../../service/axios"
import { AuthContext, PopupContext } from '../..';
import StarsIcon from '@mui/icons-material/Stars';
import ImageBox from '../../components/main/image_box/ImageBox';
import { friendsStateToProps } from '../../store/dispatcher';
import { connect } from 'react-redux';

const Ranking = () => {
  const {show_profile} = useContext(PopupContext);
  const {user} = useContext(AuthContext);
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

  let position = 0;
  let last_score = 0;
  

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
            ranking.map((elem: any, id: number) => {
              if (elem.score != last_score) {
                position += 1;
                last_score = elem.score;
              }
              return (
                <tr key={id}>
                  <td><div className='ranking'>{position} {position <= 3 ? <StarsIcon className={"abc"[position - 1]} /> : null}</div></td>
                  <td>
                      <div className='friend-picture-name'>
                        <ImageBox onClick={() => show_profile(elem.id)} user={elem} is_you={user.id == elem.id} />
                        <span>{elem.name} {user.id == elem.id ? "(you)" : ""}</span>
                      </div>
                  </td>
                  <td>{elem.score}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
}

export default connect(friendsStateToProps, null)(Ranking)