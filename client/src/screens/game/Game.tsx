import { Button } from '@mui/material'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { AuthContext, PopupContext, SocketContext } from '../..'
import { socket_url } from '../../constants/constants'
import ClassicGame from './classic/ClassicGame'
import "./style.scss"
import "../game_matching/style.scss"
import { connect } from 'react-redux'
import { gameStateToProps, mapDispatchToProps } from '../../store/dispatcher'
import ImageBox from '../../components/main/image_box/ImageBox'

type Update = {
	player_1: {
		x: number,
		y: number
	},
	player_2: {
		x: number,
		y: number
	},
	ball: {
		x: number,
		y: number
	}
}

type Score = {
	player_1: number,
	player_2: number
}

type Props = {
	game?: any;
	fetchCurrentGame?: any,
	game_history?: any,
	fetchSelectedGame?: any,
	clearGame?: any,
	fetchGameHistory?: any
}

const Game = (props: Props) => {
	const navigate = useNavigate();
	const {in_game} = useContext(SocketContext);
	const new_pos = useRef((player_1_x: number, player_1_y: number, player_2_x: number, player_2_y: number, ball_x: number, ball_y: number) => {});
	const set_score = useRef((player_1: number, player_2: number) => {});
	const {user, profile} = useContext(AuthContext);
	const isup = useRef(false);
	const isdown = useRef(false);
	const [started, setStarted] = useState(false);
	const [gameStatus, setgameStatus] = useState("");
	const {game_id} = useParams();
	let [searchParams, setSearchParams] = useSearchParams();
	const watch = searchParams.get("type");
	const socket = useRef<any | null>(null);
	const {show_profile} = useContext(PopupContext);

	const send_socket = (message: any, type: string) => {
		if (socket.current) {
			socket.current.emit(type, message);
		}
	}
	

	const key_down_handler = (e: any) => {
		if (e.key == "ArrowDown") {
			isdown.current = true;
			send_socket({
				up: isup.current,
				down: isdown.current,
			}, "input")
		} else if (e.key == "ArrowUp") {
			isup.current = true;
			send_socket({
				up: isup.current,
				down: isdown.current,
			}, "input")
		}
	}

	const key_up_handler = (e: any) => {
		if (e.key == "ArrowDown") {
			isdown.current = false;
			send_socket({
				up: isup.current,
				down: isdown.current,
			}, "input")
		} else if (e.key == "ArrowUp") {
			isup.current = false;
			send_socket({
				up: isup.current,
				down: isdown.current,
			}, "input")
		}
	}

	useEffect(() => {
		document.body.classList.add("full-screen");
		in_game(true);

		window.addEventListener("keydown", key_down_handler);
		window.addEventListener("keyup", key_up_handler);

		if (user.token && !socket.current) {

			socket.current = io(socket_url + `/game`, {
				auth: {
					"address": `${game_id}`
				},
				extraHeaders: {
					Authorization: `${user.token}`
				},
			});

			socket.current.on('connect', () => {
				console.log("connect")
				if (!watch) {
					props.fetchCurrentGame().then((e: any) => {
						if (e.payload && e.payload != "") {
							set_score.current(e.payload.winnerScore, e.payload.loserScore);
						} else {
							props.fetchSelectedGame(game_id);
						}
					});
				} else {
					props.fetchSelectedGame(game_id).then((e: any) => {
						if (e.payload && e.payload != "") {
							set_score.current(e.payload.winnerScore, e.payload.loserScore);
						}
					});
				}
			});

			socket.current.on('disconnect', () => {
				console.log("disconnect")
				setgameStatus("stop");
			});

			socket.current.on('end', () => {
				props.fetchSelectedGame(game_id);
				setgameStatus("stop");
			});

			socket.current.on('start', () => {
				setTimeout(() => {
					if (!watch) {
						props.fetchCurrentGame().then((e: any) => {
							if (e.payload)
								set_score.current(e.payload.winnerScore, e.payload.loserScore);
							setTimeout(() => {
								setgameStatus("started");
							}, 100);
						});
					}
				}, 100);
			});

			socket.current.on('error', (e: any) => {console.log("error", e)});

			socket.current.on('join', () => {console.log("join")});

			socket.current.on('watch', () => {
				props.fetchSelectedGame(game_id).then((e: any) => {
					if (e.payload)
						set_score.current(e.payload.winnerScore, e.payload.loserScore);
					setTimeout(() => {
						setgameStatus("started");
					}, 100);
				});
			});

			socket.current.on('watch', () => {console.log("watch")});

			socket.current.on('score', (e: Score) => {
				set_score.current(e.player_1, e.player_2);
			});

			socket.current.on('update', (e: Update) => {
				new_pos.current(e.player_1.x, e.player_1.y, e.player_2.x, e.player_2.y, e.ball.x, e.ball.y);
			});
		}
		
		return () => {
			document.body.classList.remove("full-screen");
			window.removeEventListener("keydown", key_down_handler);
			window.removeEventListener("keyup", key_up_handler);
			props.clearGame();
			props.fetchGameHistory();
			profile(user.token);
			in_game(false);
			if (socket.current) {
				socket.current.close()
				socket.current = null;
			}
		}
	}, [])
	
	if ((gameStatus == "" && props.game?.status != 1) || !props.game) {
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

	if (!props.game?.winner || !props.game?.loser) {
		return null;
	}

	const is_watcher = user.id != props.game.loser_id && user.id != props.game.winner_id;

	if (gameStatus == "stop") {
		return (
			<div className='end-game'>
				<div className='end-game-center'>
					<h1>Game completed</h1>
					<div className='game-winner-loser'>
						<div className='user-container'>
							<ImageBox need_margin={false} is_you={user.id == props.game.winner_id} user={props.game.winner} onClick={() =>show_profile(props.game.winner_id.toString())} />
							<span className='win-name'>{props.game.winner.name} - <span className='win-score'>{props.game.winnerScore}</span></span>
							<span className='win-box' style={{backgroundColor: "var(--success)"}}>Won</span>
							<span className='win-elo'>+{props.game.elo} elo</span>
						</div>
						<div className='user-container'>
							<ImageBox need_margin={false} is_you={user.id == props.game.loser_id} user={props.game.loser} onClick={() =>show_profile(props.game.loser_id.toString())} />
							<span className='win-name'>{props.game.loser.name} - <span className='win-score'>{props.game.loserScore}</span></span>
							<span className='win-box' style={{backgroundColor: "var(--error)"}}>Lost</span>
							<span className='win-elo'>-{props.game.elo} elo</span>
						</div>
					</div>
					<Button variant='outlined' onClick={() => navigate("/")}>Return home</Button>
				</div>
			</div>
		)
	}

	const reverte = (props.game.loser_id == user.id);
	
  	return (
		<div id="game">
			<ClassicGame reverte={reverte} your_color={reverte ? props.game.loser?.custom : props.game.winner?.custom} other_color={!reverte ? props.game.loser?.custom : props.game.winner?.custom} set_score={set_score} new_pos={new_pos} />
		</div>
  	)
}

export default connect(gameStateToProps, mapDispatchToProps)(Game)