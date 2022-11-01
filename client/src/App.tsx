import React, { Component, useContext, useEffect } from "react";
import {
  Route,
  NavLink,
  HashRouter,
  Routes
} from "react-router-dom";
import { connect } from 'react-redux';
import Navbar from "./components/nav/Navbar";
import Main from "./Main";
import { mapDispatchToProps, mapStateToProps } from "./store/dispatcher";
import { fetchMessages } from "./store/slices/messages";

export type Props = {
	messages?: any,
	fetchMessages?: any,
};

/**
 * React Component
 * Use the HashRouter to keep the UI in sync with the URL.
 * Call of the NavBar with Main as child.
 */
const App: React.FC<Props> = ({messages, fetchMessages}) => {

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
