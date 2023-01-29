import { store_items } from "../../../constants/store_items";

function drawCircle(x: number, y: number, radius: number, context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
}

export const draw_ball = (ball_x: number, ball_y: number, tic: number, key: string, context: CanvasRenderingContext2D | null) => {
    if (!context) {
        return;
    }
    let ball = {...store_items["balls"][key]};
    if (!ball) {
        ball = {
            shape: "square",
            color: "rgba(0, 0, 0, 0.7)",
        };
    }
    if (ball.color == "rainbow") {
        if (tic < 14) {
            ball.color = "#ff0000";
        } else if (tic < 28) {
            ball.color = "#ffa500";
        } else if (tic < 42) {
            ball.color = "#ffff00";
        } else if (tic < 56) {
            ball.color = "#008000";
        } else if (tic < 70) {
            ball.color = "#0000ff";
        } else if (tic < 84) {
            ball.color = "#4b0082";
        } else {
            ball.color = "#ee82ee";
        }
    }
    context.fillStyle = ball.color;
    if (ball.shape == "square")
	    context.fillRect(ball_x - 5, ball_y - 5, 10, 10);
    else
        drawCircle(ball_x, ball_y, 5, context);
}

export const draw_pad = (pad_x: number, pad_y: number, tic: number, key: string, context: CanvasRenderingContext2D | null) => {
    if (!context) {
        return;
    }
    let ball = {...store_items["pads"][key]};
    if (!ball) {
        ball = {
            color: "rgba(0, 0, 0, 0.7)",
        };
    }
    if (ball.color == "rainbow") {
        if (tic < 14) {
            ball.color = "#ff0000";
        } else if (tic < 28) {
            ball.color = "#ffa500";
        } else if (tic < 42) {
            ball.color = "#ffff00";
        } else if (tic < 56) {
            ball.color = "#008000";
        } else if (tic < 70) {
            ball.color = "#0000ff";
        } else if (tic < 84) {
            ball.color = "#4b0082";
        } else {
            ball.color = "#ee82ee";
        }
    }
    context.fillStyle = ball.color;
    //context.fillRect(pad_x - 5, pad_y - 30, 10, 60);
    context.fillRect(pad_x, pad_y, 10, 60);
}