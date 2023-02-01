import React, { useEffect } from 'react'
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { gameStateToProps, mapDispatchToProps } from '../../store/dispatcher';
import "./style.scss"

type Props = {
	game?: any,
	gameMaking?: any,
}

const GameMatching = (props: Props) => {

	const navigate = useNavigate();
	
	useEffect(() => {
		document.body.classList.add("full-screen");
		const out = setTimeout(() => {
			props.gameMaking();
		}, 100);
		return () => {
			document.body.classList.remove("full-screen");
			clearTimeout(out);
		}
	}, [])

	useEffect(() => {
		console.log(props.game)
		if (props.game) {
			navigate(`/play/${props.game.address}`)
		}
	}, [props.game])
	
	
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

export default connect(gameStateToProps, mapDispatchToProps)(GameMatching);