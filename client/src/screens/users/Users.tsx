import React, { useEffect, useState } from 'react'
import Loading from '../../components/main/loading/Loading';
import "./style.scss"
import axios from "../../service/axios"
import { useNavigate, useParams } from 'react-router-dom';
import { generate_score_data } from '../../functions/score_data';
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts';
import { connect } from 'react-redux';
import { gameStateToProps, mapDispatchToProps } from '../../store/dispatcher';


type Props = {
  game_history?: any,
}

const opt_weekday: Intl.DateTimeFormatOptions = { year: "numeric", month: 'short', day: 'numeric', hour: "numeric", minute: "numeric" };

const Users = (props: Props) => {

  const [user, setUser] = useState<any | null>(null);
  const {player_id} = useParams();
  const user_id = parseInt(player_id ? player_id : "-1");
  const width = window.innerWidth;
  const navigate = useNavigate();

  const get_user = async () => {
    const [user_data, games] = await Promise.all([
      axios.get(`/user/other/${player_id}`).then(e => e.data).catch(e => {console.log(e);return null}),
      axios.get(`/game/games/${player_id}`).then(e => e.data).catch(e => null)
    ])
    if (user_data && games) {
      games.forEach((element: any) => {
        if (user_data.id == element.winner_id) {
          element.is_won = true;
        } else {
          element.is_won = false;
        }
      })
      games.sort((a: any, b: any) => {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      
      const new_user = {...user_data, games: games}
      setUser(new_user);
    }
  }

  useEffect(() => {
    get_user();
  }, [])
  

  if (!user)
    return <Loading/>

  const graph_data = generate_score_data(user_id, [...user.games].reverse());

  return (
    <div id="user-view">
      <h1>{user.name}</h1>
      <div className='user-div'>
        <h2>Elo evolution</h2>
        <AreaChart width={width < 673 ? width - 40 : width - 100} height={180} data={graph_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" />
          <YAxis type="number" domain={['dataMin', 'dataMax']} />
          <Tooltip contentStyle={{backgroundColor: "var(--background)"}} />
          <Area type="monotone" dataKey="amt" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
      </div>
      <div className='user-div'>
        <h2>Match history</h2>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Type</th>
              <th>Date</th>
              <th>Opponent</th>
              <th>Score</th>
              <th>Elo los/win</th>
            </tr>
          </thead>
          <tbody>
            {
              user.games.map((elem: any, id: number) => {
                const date = new Date(elem.date).toLocaleDateString(`fr-FR`, opt_weekday);
                const is_winner = user_id == elem.winner_id;
                const score = `${is_winner ? elem.winnerScore : elem.loserScore}-${is_winner ? elem.loserScore : elem.winnerScore}`
                return (
                  <tr onClick={() => navigate(`/play/${elem.address}`)} key={id}>
                    <td><div className='table-elem-card' style={{backgroundColor: is_winner ? "var(--success)" : "var(--error)"}}>{is_winner ? "Won" : "Lost"}</div></td>
                    <td style={{color: elem.type == 0 ? "var(--success)" : "var(--warning)"}}>{elem.type == 0 ? "friendly" : "competitive"}</td>
                    <td>{date}</td>
                    <td>{is_winner ? elem.winner.name : elem.loser.name}</td>
                    <td>{score}</td>
                    <td>{elem.elo}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default connect(gameStateToProps, mapDispatchToProps)(Users);