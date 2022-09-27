import React, { Component } from "react";
import {
  Route,
  NavLink,
  HashRouter,
  Routes
} from "react-router-dom";
import Main from "./Main";

function App() {
	return (
		<HashRouter>
			<div>
				<ul className="header">
				<li><NavLink to="/">Home</NavLink></li>
				<li><NavLink to="/login">Stuff</NavLink></li>
				</ul>
				<div className="content">
					<Main />
				</div>
			</div>
		</HashRouter>
	);
}

export default App;
