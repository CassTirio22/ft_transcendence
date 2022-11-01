import React, { useContext } from 'react'
import {
	Link,
	NavLink, useLocation,
} from "react-router-dom";
import './landing_navbar.scss'
import logo from "../../../assets/images/ping-pong.png"
import { AuthContext } from '../../..';

function LandingNavbar() {

	const location = useLocation();
	const {user} = useContext(AuthContext);

	console.log(user.token)

	return (
		<nav className='navbar_vertical' id="navbar">
			<ul>
				<li className="logo unhover">
					<div className="navigation_elem">
						<img alt="Pong logo" src={logo} />
					</div>
				</li>

				<li className={location.pathname === "/" ? "active hov" : "hov" }>
					<Link to='/'>
						<p>Home</p>
					</Link>
				</li>
				<li className={location.pathname === "/play" ? "active hov" : "hov" }>
					<Link to='/play'>
						<p>How does it work</p>
					</Link>
				</li>
				<li className={location.pathname === "/watch" ? "active hov" : "hov" }>
					<Link to='/watch'>
						<p>About team</p>
					</Link>
				</li>
			</ul>
		</nav>
	)
}

export default LandingNavbar