import React from 'react'
import "./button.scss"

type ButtonProps = {
	title: string;
	onPress: any;
	width: string;
};

const Button = ({title, onPress, width}: ButtonProps) => {
	return (
		<div onClick={onPress} className='base_button' style={{width: width}}>
			<p>{title}</p>
		</div>
	)
}

export default Button