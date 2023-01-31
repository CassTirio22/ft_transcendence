import { Button } from '@mui/material'
import React, { useContext, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { AuthContext, SocketContext } from '../..'
import { socket_url } from '../../constants/constants'
import ClassicGame from './classic/ClassicGame'
import "./style.scss"

const players_move = 10;
const ball_speed = 12;
const interval = 20;


let main_width = 1000;
let main_height = 1000;

let ball_x_start = main_width / 2;
let ball_y_start = main_height / 2;
let players_start = main_height / 2 - 20;

const getRandomInt = (max: number) => {
	return Math.floor(Math.random() * max);
}

const random_ball = () => {
	return Math.random() * Math.PI / 2 - Math.PI / 4 + getRandomInt(2) * Math.PI;
}

let player_y = players_start;
let player_move = "n";
let computer_y = players_start;
let ball_angle = random_ball();
let ball_x = ball_x_start;
let ball_y = ball_y_start;
let player_score = 0;
let computer_score = 0;

const touch_player = (player: string, player_y: number, computer_y: number, ball_angle: number) => {
	const x = player == "player" ? 0 : main_width - 30;
	const c_pos = player == "player" ? player_y : computer_y;
	let ang = ball_angle + Math.PI;
	if (ang < 0)
		ang += 2 * Math.PI;
	const abstract = (ang > Math.PI / 2) && (ang < Math.PI / 2 * 3);

	if (abstract && player == "player") {
		return false;
	}
	if (!abstract && player == "computer") {
		return false;
	}
	return (ball_x >= x && ball_x <= x + 30) && (ball_y >= c_pos - 5 && ball_y <= c_pos + 70);
}

const get_ball_angle = (ball_y: number, player_y: number, is_computer: boolean) => {
	const player_center = player_y + 30;
	let diff = ball_y - player_center;
	if (diff > 30)
		diff = 30;
	if (diff < -30)
		diff = -30;
	return 1.109 / 30 * diff * (is_computer ? -1 : 1) + (is_computer ? Math.PI : 0);
}

const move_ball = (set_score: any) => {
	ball_x += ball_speed * Math.cos(ball_angle);
	ball_y += ball_speed * Math.sin(ball_angle);

	if (ball_x > main_width ) {
		ball_x = ball_x_start;
		ball_y = ball_y_start;
		player_score += 1;
		set_score.current(player_score, computer_score);
		ball_angle = random_ball();
	} else if (ball_x < 0) {
		ball_x = ball_x_start;
		ball_y = ball_y_start;
		computer_score += 1;
		set_score.current(player_score, computer_score);
		ball_angle = random_ball();
	}
	if (ball_y >= main_height - 10) {
		ball_angle = -ball_angle;
	} else if (ball_y <= 10) {
		ball_angle = -ball_angle;
	}
}

const computer_move = (computer_y: number, ball_y: number) => {
	let move = players_move;

	if (ball_y > computer_y + 10 && ball_y < computer_y + 50)
		move = 0;
	let y = ball_y > computer_y + 30 ? computer_y + move : computer_y - move;

	if (y < 10)
		y = 10;
	if (y > main_height - 70)
		y = main_height - 70;
	return y;
}

const player_move_ord = (computer_y: number, ball_y: number) => {
	let move = players_move;

	if (ball_y > player_y + 10 && ball_y < player_y + 50)
		move = 0;
	let y = ball_y > player_y + 30 ? player_y + move : player_y - move;

	if (y < 10)
		y = 10;
	if (y > main_height - 70)
		y = main_height - 70;
	return y;
}

const loop = (new_pos: any, set_score: any) => {
	player_y = player_move_ord(player_y, ball_y);
	computer_y = computer_move(computer_y, ball_y);
	move_ball(set_score);
	if (touch_player("player", player_y, computer_y, ball_angle)) {
		ball_angle = get_ball_angle(ball_y, player_y, false);
	}
	if (touch_player("computer", player_y, computer_y, ball_angle)) {
		ball_angle = get_ball_angle(ball_y, computer_y, true);
	}
	new_pos.current(player_y, computer_y, ball_x, ball_y);
}

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

const Game = () => {
	const navigate = useNavigate();
	const {in_game} = useContext(SocketContext);
	const new_pos = useRef((player_1_x: number, player_1_y: number, player_2_x: number, player_2_y: number, ball_x: number, ball_y: number) => {});
	const set_score = useRef((player_1: number, player_2: number) => {});
	const {user} = useContext(AuthContext);
	const isup = useRef(false);
	const isdown = useRef(false);

	const socket = useRef<any | null>(null);

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

		const key_down_inter = window.addEventListener("keydown", key_down_handler);
		const key_up_inter = window.addEventListener("keyup", key_up_handler);

		if (user.token && !socket.current) {
			socket.current = io(socket_url + "/game", {
				extraHeaders: {
				  Authorization: `${user.token}`
				}
			});

			socket.current.on('connect', () => {
				console.log("connected")
			});

			socket.current.on('disconnect', () => {
				console.log("disconnected")
			});

			socket.current.on('start', () => {
				console.log("start")
			});

			socket.current.on('error', () => {
				console.log("error")
			});

			socket.current.on('join', () => {
				console.log("join")
			});

			socket.current.on('watch', () => {
				console.log("watch")
			});

			socket.current.on('update', (e: Update) => {
				new_pos.current(e.player_1.x, e.player_1.y, e.player_2.x, e.player_2.y, e.ball.x, e.ball.y);
			});
		}
		return () => {
			document.body.classList.remove("full-screen");
			window.removeEventListener("keydown", key_down_handler);
			window.removeEventListener("keyup", key_up_handler);
			in_game(false);
		}
	}, [])
	
  return (
		<div id="game">
			<ClassicGame set_score={set_score} new_pos={new_pos} />
		</div>
  )
}

export default Game