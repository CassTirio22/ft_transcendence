import { Button } from '@mui/material'
import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SocketContext } from '../..'
import "./style.scss"

const Game = () => {

	const navigate = useNavigate();
	const {in_game} = useContext(SocketContext);

	useEffect(() => {
		document.body.classList.add("full-screen");
		in_game(true);
		return () => {
			document.body.classList.remove("full-screen");
			in_game(false);
		}
	}, [])
	
  return (
		<div id="game">
			<div className='center'>
				<h1>This will be the game page.</h1>
				<Button onClick={() => navigate("/")}>stop game and return home</Button>
			</div>
		</div>
  )
}

export default Game