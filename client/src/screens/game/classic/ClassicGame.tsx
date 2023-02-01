import { Button } from '@mui/material'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../..';
import { draw_ball, draw_pad } from '../draw/draw_fcts';
import "./style.scss"

function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return {
		width,
		height
	};
}

const dimentions = getWindowDimensions();

let main_width = dimentions.width - 4;
let main_height = dimentions.height - 4;

if (main_width < main_height) {
	main_height = main_width
} else {
	main_width = main_height
}


let last_ball_x = -1;
let ball_x_side = -1;

let last_ball_y = -1;
let ball_y_side = -1;

const ball_pad = require("../sound/ball_pad_song.wav")
const ball_pad_song = new Audio(ball_pad);

const ball_wall = require("../sound/ball_wall_song.wav")
const ball_wall_song = new Audio(ball_wall);

let timout: any = null;

let tic = 0;

const draw_game = (context: CanvasRenderingContext2D | null, player1_y: number, player1_x: number, player2_y: number, player2_x: number, ball_x: number, ball_y: number, ball_style: string, player_1_style: string, player_2_style: string, ratio: number) => {
	tic += 1;
	if (tic > 100)
		tic = 0;
	if (!context)
		return;
	// if (last_ball_x != -1) {
	// 	if (ball_x_side != -1) {
	// 		if ((ball_x > last_ball_x && ball_x_side == 1) || (ball_x < last_ball_x && ball_x_side == 0)) {
	// 			ball_pad_song.play()
	// 		}
	// 	}
	// 	ball_x_side = ball_x > last_ball_x ?  0 : 1;
	// }
	// last_ball_x = ball_x;

	// if (last_ball_y != -1) {
	// 	if (ball_y_side != -1) {
	// 		if ((ball_y > last_ball_y && ball_y_side == 1) || (ball_y < last_ball_y && ball_y_side == 0)) {
	// 			ball_wall_song.play()
	// 		}
	// 	}
	// 	ball_y_side = ball_y > last_ball_y ?  0 : 1;
	// }
	// last_ball_y = ball_y;

	context.clearRect(-100, -100, context.canvas.width + 100, context.canvas.height + 100);
	context.fillStyle = '#000';
	context.fillRect(0, 0, main_width, main_height);
	draw_ball(ball_x, ball_y, tic, ball_style, context, ratio);
	draw_pad(player1_x, player1_y, tic, player_1_style == "classic-invisible" ? "classic-write" : player_1_style, context, ratio);
	draw_pad(player2_x, player2_y, tic, player_2_style == "classic-invisible" ? "classic-impossible" : player_2_style, context, ratio);

	context.strokeStyle = "rgba(255, 255, 255, 0.6)";
	
	context.beginPath();
	context.setLineDash([5, 15]);
	context.lineWidth = 4;
	context.moveTo(Math.floor(context.canvas.width / 2), 0);
	context.lineTo(Math.floor(context.canvas.width / 2), context.canvas.height);
	context.stroke();
}

type GameProps = {
	new_pos: any,
	set_score: any,
	other_color: string,
	your_color: string,
	reverte: boolean
}

const ClassicGame = (props: GameProps) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);
	const [score, setScore] = useState([0, 0]);
	const {user} = useContext(AuthContext);
	const [reload, setReload] = useState(0);
	const color = props.other_color ? JSON.parse(props.other_color).selected_pad : null;
	const p_color = props.your_color ? JSON.parse(props.your_color).selected_pad : null;

	const get_new_pos = (player_1_x: number, player_1_y: number, player_2_x: number, player_2_y: number, ball_x: number, ball_y: number) => {
		const ratio = main_width / 1000;

		if (props.reverte) {
			draw_game(contextRef.current, player_1_y * ratio, (1000 - player_1_x) * ratio, player_2_y * ratio, (1000 - player_2_x) * ratio, (1000 - ball_x) * ratio, ball_y * ratio, user.store.selected_ball, color, p_color, ratio);
		} else {
			draw_game(contextRef.current, player_1_y * ratio, player_1_x * ratio, player_2_y * ratio, player_2_x * ratio, ball_x * ratio, ball_y * ratio, user.store.selected_ball, p_color, color, ratio);
		}
	}

	const set_score = (player_1: number, player_2: number) => {
		if (props.reverte) {
			setScore([player_2, player_1]);
		} else {
			setScore([player_1, player_2]);
		}
	}

	useEffect(() => {}, [props.other_color])
	

	useEffect(() => {
		function handleResize() {
			clearTimeout(timout);
			
			timout = setTimeout(() => {
				const {width, height} = getWindowDimensions();
				main_height = height - 4;
				main_width = width - 4;
				
				if (main_width < main_height) {
					main_height = main_width
				} else {
					main_width = main_height
				}

				setReload(main_width);
			}, 500);
		}

		window.addEventListener('resize', handleResize);
		handleResize();
		props.new_pos.current = get_new_pos;
		props.set_score.current = set_score;

		if (canvasRef.current) {
			let canvas = canvasRef.current;
			let context = canvas.getContext('2d');
			contextRef.current = context;
			// draw_game(contextRef.current, 10, 0, 10, 0, 100, 100, "round-write", "dotted-write", "dotted-red");
			// draw_game(contextRef.current, 10, 0, 10, 0, 100, 100, "round-write", "dotted-write", "dotted-red");
		}

		return () => window.removeEventListener('resize', handleResize);
	}, [])
	
  	return (
		<div className='game-div'>
			<div className='score'>
				<span>{score[0]}</span>
				<span>{score[1]}</span>
			</div>
			<canvas ref={canvasRef} width={main_width} height={main_height}>
				Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
			</canvas>
		</div>
  	)
}

export default ClassicGame