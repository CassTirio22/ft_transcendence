import { Button } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext, PopupContext } from '../..';
import ImageBox from '../../components/main/image_box/ImageBox';
import axios from "../../service/axios"
import "./style.scss"

const WatchGame = () => {

	const [games, setGames] = useState([]);
	const {user} = useContext(AuthContext);
	const {show_profile} = useContext(PopupContext);
	const navigate = useNavigate();

	const load_games = async () => {
		const ret = await axios.get("/game/currents")
			.then(e => e.data)
			.catch(e => null);
		if (ret) {
			setGames(ret);
		}
	}

	useEffect(() => {
		load_games();
	
	}, [])
	
		
	return (
		<div id="watch-game" className='main-view'>
				<h1>Watch game</h1>
				<div className='games-wrapper'>
					{
						games.map((elem: any, number: any) => {
							const user_1: any = elem.winner;
							const user_2: any = elem.loser;
							return (
								<div className='watch-game-div' key={number}>
									<div className='game-player'>
										<ImageBox is_you={user.id == user_1.id} user={user_1} onClick={() =>show_profile(user_1.id.toString())} />
										<span>{user_1.name}</span>
									</div>
									<Button variant='outlined' onClick={() => navigate(`/play/${elem.address}?type=watch`)} >Watch game</Button>
									<div className='game-player'>
										<span>{user_2.name}</span>
										<ImageBox is_you={user.id == user_2.id} user={user_2} onClick={() =>show_profile(user_2.id.toString())} />
									</div>
								</div>
							);
						})
					}
				</div>
		</div>
	)
}

export default WatchGame