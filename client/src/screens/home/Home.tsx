import { Button } from '@mui/material';
import React, { useContext, useEffect } from 'react'
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { AuthContext, PopupContext } from '../..'
import { TOAST_LVL } from '../../constants/constants';
import { friendsStateToProps } from '../../store/dispatcher';
import "./style.scss"

const data = [
	{
	  "name": "Page A",
	  "uv": 4000,
	  "pv": 2400,
	  "amt": 2400
	},
	{
	  "name": "Page B",
	  "uv": 3000,
	  "pv": 1398,
	  "amt": 2210
	},
	{
	  "name": "Page C",
	  "uv": 2000,
	  "pv": 9800,
	  "amt": 2290
	},
	{
	  "name": "Page D",
	  "uv": 2780,
	  "pv": 3908,
	  "amt": 2000
	},
	{
	  "name": "Page E",
	  "uv": 1890,
	  "pv": 4800,
	  "amt": 2181
	},
	{
	  "name": "Page F",
	  "uv": 2390,
	  "pv": 3800,
	  "amt": 2500
	},
	{
	  "name": "Page G",
	  "uv": 3490,
	  "pv": 4300,
	  "amt": 2100
	}
]
	

type Props = {
	friends?: any;
}

const Home = (props: Props) => {

	const friend_count = props.friends?.filter((elem: any) => elem.status != 1).length;
	const {user} = useContext(AuthContext);
	const navigate = useNavigate();
	const width = window.innerWidth;

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
					<AreaChart width={width - 440} height={180} data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
						<defs>
							<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
								<stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
							</linearGradient>
						</defs>
						<XAxis dataKey="name" />
						<YAxis />
						<Tooltip contentStyle={{backgroundColor: "var(--background)"}} />
						<Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
					</AreaChart>
				</div>
			</div>
		</div>
	)
}

export default connect(friendsStateToProps, null)(Home)