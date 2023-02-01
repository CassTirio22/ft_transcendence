import React, { useEffect, useState } from 'react'
import axios from "../../service/axios"

const WatchGame = () => {

	const [games, setGames] = useState([]);

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
		</div>
	)
}

export default WatchGame