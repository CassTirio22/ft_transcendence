import React, { useContext } from 'react'
import {
	Link,
	NavLink, useLocation,
} from "react-router-dom";
import './landing_navbar.scss'
import logo from "../../../assets/images/test.png"
import { AuthContext } from '../../..';

function LandingNavbar() {

	const location = useLocation();
	const {user} = useContext(AuthContext);
	return (
		<nav className='navbar_vertical' id="navbar">
			<div className="logo_div">
				<img alt="Pong logo" src={logo} />
				<h1>Transcendence</h1>
			</div>
			<ul>
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
			<ul>
				<li className={location.pathname === "/" ? "active hov" : "hov" }>
					<Link to='/login'>
						<p>Login</p>
					</Link>
				</li>
				<li className={location.pathname === "/play" ? "active hov" : "hov" }>
					<Link to='/register'>
						<p>Sign Up</p>
					</Link>
				</li>
			</ul>
		</nav>
	)
}

export default LandingNavbar