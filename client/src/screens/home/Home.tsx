import { Button } from '@mui/material';
import React, { useContext, useEffect } from 'react'
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { AuthContext, PopupContext } from '../..'
import { TOAST_LVL } from '../../constants/constants';
import { generate_score_data } from '../../functions/score_data';
import { friendGameStateToProps, friendsStateToProps } from '../../store/dispatcher';
import "./style.scss"

type Props = {
	friends?: any;
	game_history?: any;
}

const Home = (props: Props) => {

	const friend_count = props.friends?.filter((elem: any) => elem.status != 1).length;
	const {user} = useContext(AuthContext);
	const navigate = useNavigate();
	const width = window.innerWidth;

	const graph_data = generate_score_data(user.id, props.game_history.done);
	return (
		<div id="home">
			<div className='home-header'>
				<h1>Welcome <span>{user.name}</span></h1>
				<Button onClick={() => navigate("/play")}>New game</Button>
			</div>
			<div className='row'>
				<div className='col'>
					<div className='dashboard-box text-color'>
						<div>
							<span>Friends online</span>
							<i className="fas fa-users"></i>
						</div>
						<span>{friend_count}</span>
					</div>
					<div className='dashboard-box text-color'>
						<div>
							<span>Your score</span>
							<i className="fas fa-trophy"></i>
						</div>
						<span>{user.score}</span>
					</div>
				</div>
				<div className='chart-container dashboard-box'>
					<AreaChart width={width < 673 ? width - 60 : width < 800 ? width - 120 : width - 440} height={180} data={graph_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
			</div>
			<div className='row'>
				<div className='col home-box'>
				<h2>My pending games</h2>
					{
						props.game_history.pending.map((elem: any, id: number) => {
							return (
								<div key={id}>
									<span>{elem.type == 0 ? "friendly" : "competitive"}</span>
									<span>{elem.address}</span>
									<Button onClick={() => navigate(`/play/${elem.address}`)}>Rejoin</Button>
								</div>
							)
						})
					}
					{
						!props.game_history.ongoing ? null :
						<>
						<h3>Ongoing game</h3>
						<div >
							<span>{props.game_history.ongoing.type == 0 ? "friendly" : "competitive"}</span>
							<span>{props.game_history.ongoing.address}</span>
							<Button onClick={() => navigate(`/play/${props.game_history.ongoing.address}`)}>Rejoin</Button>
						</div>
						</>
					}
				</div>
				<div className='col home-box'>
				<h2>Want to watch a game ?</h2>
				{
					props.game_history.pending.map((elem: any, id: number) => {
						return (
							<div key={id}>

							</div>
						)
					})
				}
				</div>
			</div>
		</div>
	)
}

export default connect(friendGameStateToProps, null)(Home)