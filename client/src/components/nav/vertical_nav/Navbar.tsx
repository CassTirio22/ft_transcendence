import React, { useContext } from 'react'
import {
	Link,
	NavLink, useLocation,
} from "react-router-dom";
import './navbar.css'
import logo from "../../../assets/images/test.png"
import { AuthContext } from '../../..';

function Navbar() {

	const location = useLocation();
	const {user, signOut, isLoggedIn} = useContext(AuthContext);

	return (
		<aside className="navigation">
			<nav id="navbar">
				<ul>
					<li className="logo unhover">
						<div className="navigation_elem">
							<img alt="Pong logo" src={logo} />
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
					<li>
						<div className="separator">
							<h2 className="separator_title">Social</h2>
						</div>
					</li>
					<li className={location.pathname === "/friends" ? "active hov" : "hov" }>
						<Link to='/friends'>
							<div className="navigation_elem">
								<i className="fas fa-users"></i>
								<p>Friends</p>
							</div>
						</Link>
					</li>
					<li className={location.pathname.includes("conversations") ? "active hov" : "hov" }>
						<Link to='/conversations'>
							<div className="navigation_elem">
								<i className="fas fa-comments"></i>
								<p>Conversations</p>
							</div>
						</Link>
					</li>
					<li className={location.pathname === "/ranking" ? "active hov" : "hov" }>
						<Link to='/ranking'>
							<div className="navigation_elem">
								<i className="fas fa-trophy"></i>
								<p>Ranking</p>
							</div>
						</Link>
					</li>
					<li>
						<div className="separator">
							<h2 className="separator_title">Account</h2>
						</div>
					</li>
					<li className={location.pathname === "/me/profile" ? "active hov" : "hov" }>
						<Link to='/me/profile'>
							<div className="navigation_elem">
								<i className="fas fa-user"></i>
								<p>Profile</p>
							</div>
						</Link>
					</li>
					<li className={location.pathname === "/logout" ? "active hov" : "hov" }>
						<Link to='/' onClick={signOut}>
							<div className="navigation_elem">
								<i className="fas fa-sign-out-alt"></i>
								<p>Logout</p>
							</div>
						</Link>
					</li>
				</ul>
			</nav>
		</aside>
	)
}

export default Navbar