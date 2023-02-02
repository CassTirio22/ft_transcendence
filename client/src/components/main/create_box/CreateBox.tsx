import { Button } from '@mui/material'
import React from 'react'
import "./style.scss"

type Props = {
	visible?: Boolean,
	title?: String,
	cancel?: any,
	submit?: any,
	submit_text?: String,
	submitable?: Boolean,
	children?: JSX.Element
}

const CreateBox: React.FC<Props> = ({visible, title, cancel, submit, submit_text, submitable, children}: Props) => {
	if (!visible)
		return null; 
	return (
		<div className='create-box'>
				<div className='create-box-center'>
						<div className='create-box-header'>
								<h3>{title}</h3>
						</div>
						{
								children
						}
						<div className='create-box-footer'>
								<Button onClick={cancel} variant="outlined">Cancel</Button>
								<Button disabled={!submitable} onClick={submit} variant="contained">{submit_text}</Button>
						</div>
				</div>
		</div>
	)
}

export default CreateBox