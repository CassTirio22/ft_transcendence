import { Routes, Route } from 'react-router-dom';
import Home from './screens/home/Home';
import Login from './screens/log/login/Login';
import Register from './screens/log/register/Register';
import Profile from './screens/profile/Profile';
/**
 *	React Component
 *	Describe the different possible routes and UI rendered consequently.
 */
const Main = () => {
return (         
	<Routes>
		<Route path='/' element={<Home/>} />
	</Routes>
);
}
export default Main;