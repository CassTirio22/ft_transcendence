
import React, { useContext, useState } from 'react'
import LandingPong from '../../components/landing_pong/LandingPong'
import "./landing.scss"


function Landing() {
	return (
		<section className='landing'>
			<div className='main_text'>
				<h1>Let's PONG!</h1>
				<p>Challenge your friend online in the first game of the video game industry</p>
				<p>You'll see it's trancendent</p>
			</div>
			<div className='fixed_pong'>
			<LandingPong/>
			</div>
		</section>
	)
}

export default Landing