
import React, { useContext, useState } from 'react'
import LandingPong from '../../components/landing_pong/LandingPong'
import "./landing.scss"


function Landing() {
	return (
		<section className='landing'>
			<h1>Let's PONG!</h1>
			<LandingPong/>
		</section>
	)
}

export default Landing