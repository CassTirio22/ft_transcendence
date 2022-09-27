import React, { Component } from "react";
import {
  Route,
  NavLink,
  HashRouter,
  Routes
} from "react-router-dom";

import Navbar from "./components/nav/navbar";
import Main from "./Main";

function App() {
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

export default App;
