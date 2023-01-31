import { store_items } from "../../../constants/store_items";

function drawCircle(x: number, y: number, radius: number, context: CanvasRenderingContext2D) {
    context.setLineDash([0]);
    context.beginPath();
    context.lineWidth = 5;
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.fill();
    context.stroke();
}

export const draw_ball = (ball_x: number, ball_y: number, tic: number, key: string, context: CanvasRenderingContext2D | null, ratio: number) => {
    if (!context) {
        return;
    }
    let ball = {...store_items["balls"][key]};
    if (!ball.color) {
        ball = {
            shape: "square",
            color: "rgba(255, 255, 255, 0.7)",
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
    context.strokeStyle = ball.color;
    if (ball.shape == "square")
	    context.fillRect(ball_x - 5, ball_y - 5, 14 * ratio, 14 * ratio);
    else
        drawCircle(ball_x, ball_y, 7 * ratio, context);
}

export const draw_pad = (pad_x: number, pad_y: number, tic: number, key: string, context: CanvasRenderingContext2D | null, ratio: number) => {
    if (!context) {
        return;
    }
    let ball = {...store_items["pads"][key]};
    if (!ball.color) {
        ball = {
            color: "rgba(255, 255, 255, 0.7)",
            type: "classic"
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
    if (ball.type == "dotted") {
        context.setLineDash([6]);
        context.strokeStyle = ball.color;
        context.strokeRect(pad_x - 7 * ratio, pad_y - 45 * ratio, 15 * ratio, 91 * ratio);
    } else {
        context.fillRect(pad_x - 7 * ratio, pad_y - 45 * ratio, 15 * ratio, 91 * ratio);
    }
}