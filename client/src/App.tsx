import React, { Component, useContext, useEffect } from "react";
import {
  Route,
  NavLink,
  HashRouter,
  Routes
} from "react-router-dom";
import { connect } from 'react-redux';
import Navbar from "./components/nav/vertical_nav/Navbar";
import Main from "./Main";
import { mapDispatchToProps, mapStateToProps } from "./store/dispatcher";
import { fetchMessages } from "./store/slices/messages";
import { AuthContext } from ".";
import Landing from "./screens/landing/Landing";
import LandingNavbar from "./components/nav/horizontal_nav/LandingNavbar";
import LandingMain from "./LandingMain";

export type Props = {
	messages?: any,
	fetchMessages?: any,
	fetchFriends?: any
};

/**
 * React Component
 * Use the HashRouter to keep the UI in sync with the URL.
 * Call of the NavBar with Main as child.
 */
const App: React.FC<Props> = (props) => {

	const {isLoggedIn, user} = useContext(AuthContext);

	useEffect(() => {
		if (isLoggedIn())
	  		props.fetchFriends();
	}, [user])
	

	if (!isLoggedIn()) {
		return (
			<HashRouter>
				<div>
					<LandingNavbar/>
					<div className="content">
						<LandingMain />
					</div>
				</div>
			</HashRouter>
		)
	}

	return (
		<HashRouter>
			<div>
				<Navbar/>
				<div className="content">
					<Main />
				</div>
			</div>
		</HashRouter>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
