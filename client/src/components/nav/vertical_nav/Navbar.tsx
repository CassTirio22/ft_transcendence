import React, { useContext } from 'react'
import {
	Link,
	NavLink, useLocation,
} from "react-router-dom";
import './navbar.css'
import logo from "../../../assets/images/balle.png"
import { AuthContext } from '../../..';

function Navbar() {

	const location = useLocation();
	const {user} = useContext(AuthContext);

	console.log(user.token)

	return (
		<aside className="navigation">
			<nav id="navbar">
				<ul>
					<li className="logo unhover">
						<div className="navigation_elem">
							<img alt="Pong logo" src={logo} />
							{
								user.token ?
								null :
								<div className="log_div">
									<Link className='nav_button outline' to='/login'><p>Sign in</p></Link>
									<Link className='nav_button' to='/register'><p>Sign up</p></Link>
								</div> 
							}
						</div>
					</li>

					<li className={location.pathname === "/" ? "active hov" : "hov" }>
						<Link to='/'>
							<div className="navigation_elem">
								<i className="fas fa-columns"></i>
								<p>Home</p>
							</div>
						</Link>
					</li>
					<li>
						<div className="separator">
							<h2 className="separator_title">Game</h2>
						</div>
					</li>
					<li className={location.pathname === "/play" ? "active hov" : "hov" }>
						<Link to='/play'>
							<div className="navigation_elem">
							<i className="fas fa-play"></i>
								<p>Let's play!</p>
							</div>
						</Link>
					</li>
					<li className={location.pathname === "/watch" ? "active hov" : "hov" }>
						<Link to='/watch'>
							<div className="navigation_elem">
								<i className="fas fa-eye"></i>
								<p>Watch match</p>
							</div>
						</Link>
					</li>
				</ul>
			</nav>
		</aside>
	)
}

export default Navbar