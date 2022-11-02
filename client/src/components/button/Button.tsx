import React from 'react'
import "./button.scss"

type ButtonProps = {
	title: string;
	onPress: any;
	width: string;
	disable?: boolean;
};

const Button = ({title, onPress, width, disable=false}: ButtonProps) => {
	return (
		<div onClick={() => disable ? null : onPress()} className={`base_button ${disable ? "disable" : ""}`} style={{width: width}}>
			<p>{title}</p>
		</div>
	)
}

export default Button