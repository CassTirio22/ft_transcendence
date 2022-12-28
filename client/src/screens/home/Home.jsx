import React, { useContext, useEffect } from 'react'
import { PopupContext } from '../..'
import { TOAST_LVL } from '../../constants/constants';
import "./style.scss"

const Home = () => {

	const {set_toast} = useContext(PopupContext);

	useEffect(() => {
		set_toast(TOAST_LVL.SUCCESS, "wesh c'est ok", "i hope so")
	}, [])
	

	return (
		<div>Home</div>
	)
}

export default Home