import React from 'react'
import {
	Link,
	NavLink, useLocation,
} from "react-router-dom";
import '../../styles/nav/navbar.css'
import logo from "../../assets/images/balle.png"

function Navbar() {

	const location = useLocation();

	return (
		<aside className="navigation">
			<nav id="navbar">
				<ul>
					<li className="logo unhover">
						<div className="navigation_elem">
							<img alt="Pong logo" src={logo} />
							<div className="log_div">
								<Link className='nav_button outline' to='/login'><p>Sign in</p></Link>
								<Link className='nav_button' to='/register'><p>Sign up</p></Link>
							</div>
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
							<h2 className="separator_title">Test</h2>
						</div>
					</li>
				</ul>
			</nav>
		</aside>
	)
}

export default Navbar