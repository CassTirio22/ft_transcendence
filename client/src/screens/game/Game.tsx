import { Button } from '@mui/material'
import React, { useContext, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SocketContext } from '../..'
import "./style.scss"

const players_move = 10;
const ball_speed = 12;
const interval = 20;

function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return {
		width,
		height
	};
}

const dimentions = getWindowDimensions();

let main_width = dimentions.width - 400;
let main_height = dimentions.height - 4;

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

let bot1_color = 0;
let bot2_color = 0;

let last_ball_x = -1;
let ball_x_side = -1;

let last_ball_y = -1;
let ball_y_side = -1;

const ball_pad = require("./sound/ball_pad_song.wav")
const ball_pad_song = new Audio(ball_pad);

const ball_wall = require("./sound/ball_wall_song.wav")
const ball_wall_song = new Audio(ball_wall);

const draw_game = (context: any, player1_y: number, player2_y: number, ball_x: number, ball_y: number, ) => {
	if (last_ball_x != -1) {
		if (ball_x_side != -1) {
			if ((ball_x > last_ball_x && ball_x_side == 1) || (ball_x < last_ball_x && ball_x_side == 0)) {
				ball_pad_song.play()
			}
		}
		ball_x_side = ball_x > last_ball_x ?  0 : 1;
	}
	last_ball_x = ball_x;

	if (last_ball_y != -1) {
		if (ball_y_side != -1) {
			if ((ball_y > last_ball_y && ball_y_side == 1) || (ball_y < last_ball_y && ball_y_side == 0)) {
				ball_wall_song.play()
			}
		}
		ball_y_side = ball_y > last_ball_y ?  0 : 1;
	}
	last_ball_y = ball_y;

	context.clearRect(-100, -100, context.canvas.width + 100, context.canvas.height + 100);
	context.fillStyle = '#616B78';
	context.fillRect(ball_x - 5, ball_y - 5, 10, 10);
	context.fill();
	context.fillStyle = `rgba(255, 112, 67, 1)`;
	context.fillRect(10, player1_y, 10, 60);
	context.fillStyle = `rgba(255, 112, 67, 1)`;
	context.fillRect(context.canvas.width - 20, player2_y, 10, 60);
}

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

const move_ball = () => {
	ball_x += ball_speed * Math.cos(ball_angle);
	ball_y += ball_speed * Math.sin(ball_angle);

	if (ball_x > main_width ) {
		ball_x = ball_x_start;
		ball_y = ball_y_start;
		ball_angle = random_ball();
	} else if (ball_x < 0) {
		ball_x = ball_x_start;
		ball_y = ball_y_start;
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

const loop = (context: any) => {
	player_y = player_move_ord(player_y, ball_y);
	computer_y = computer_move(computer_y, ball_y);
	move_ball();
	if (touch_player("player", player_y, computer_y, ball_angle)) {
		bot1_color = 100;
		ball_angle = get_ball_angle(ball_y, player_y, false);
	}
	if (touch_player("computer", player_y, computer_y, ball_angle)) {
		bot2_color = 100;
		ball_angle = get_ball_angle(ball_y, computer_y, true);
	}
	if (bot1_color > 0)
		bot1_color--;
	if (bot2_color > 0)
		bot2_color--;
	draw_game(context, player_y, computer_y, ball_x, ball_y);
}

const Game = () => {
	const canvasRef = useRef(null);
	const navigate = useNavigate();
	const {in_game} = useContext(SocketContext);

	let canvas: any;
	let context: any;

	const ball_pad_song = new Audio(ball_pad);

	useEffect(() => {
		document.body.classList.add("full-screen");
		in_game(true);
		canvas = canvasRef.current;
		context = canvas.getContext('2d');
		//draw_game(context, 10, 10, 100, 100);
		const inter = setInterval(() => {
			loop(context);
		}, interval)
		return () => {
			document.body.classList.remove("full-screen");
			in_game(false);
			clearInterval(inter)
		}
	}, [])
	
  return (
		<div id="game">
			<canvas ref={canvasRef} width={main_width} height={main_height}>
				Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
			</canvas>
		</div>
  )
}

export default Game