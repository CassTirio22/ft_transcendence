import { Button } from '@mui/material';
import React, { useEffect } from 'react'
import { connect } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { gameStateToProps, mapDispatchToProps } from '../../store/dispatcher';
import "./style.scss"
import axios from "../../service/axios"

type Props = {
	game?: any,
	gameMaking?: any,
}

let out: any = null;

const GameMatching = (props: Props) => {
	const navigate = useNavigate();
	let [searchParams, setSearchParams] = useSearchParams();
	const friendly = searchParams.get("friendly");

	const launch_match = () => {
		props.gameMaking();
	}

	const launch_friendly = async () => {
		if (!searchParams.get("is_creator")) {
			const ret = await axios.put("/game/join", {address: friendly})
				.then(e => e.data)
				.catch(e => null);
			navigate(`/play/${friendly}`)
		} else {
			navigate(`/play/${friendly}`)
		}
	}

	useEffect(() => {
		document.body.classList.add("full-screen");
		if (props.game != null) {
			console.log("out")
			navigate(-1);
			return;
		}
		if (friendly) {
			launch_friendly();
		}
		return () => {
			document.body.classList.remove("full-screen");
			clearTimeout(out);
		}
	}, [])

	useEffect(() => {
		if (props.game) {
			navigate(`/play/${props.game.address}`)
		}
	}, [props.game])
	
	
  	if (friendly) {
		return (
			<div id="game-matching">
				<div className='center'>
					<h1>You will be match with someone soon</h1>
					<div className='load-box'>
						<div className="loader">
							<svg viewBox="0 0 80 80">
								<circle id="test" cx="40" cy="40" r="32"></circle>
							</svg>
						</div>
	
						<div className="loader triangle">
							<svg viewBox="0 0 86 80">
								<polygon points="43 8 79 72 7 72"></polygon>
							</svg>
						</div>
	
						<div className="loader">
							<svg viewBox="0 0 80 80">
								<rect x="8" y="8" width="64" height="64"></rect>
							</svg>
						</div>
					</div>
				</div>
			</div>
		)
	}
	return (
		<div className='game-asking'>
			<div onClick={() => launch_match()} className='big-button'>
				<span>I want to start a game against some random people!</span>
			</div>
			<div onClick={() => navigate("/")} className='big-button outline'>
				<span>Naaah, I'm not good enough to try real game...</span>
			</div>
		</div>
	)
}

export default connect(gameStateToProps, mapDispatchToProps)(GameMatching);