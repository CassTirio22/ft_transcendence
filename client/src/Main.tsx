
import { Routes, Route } from 'react-router-dom';
import Conversations from './screens/conversations/Conversations';
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
		<Route path='/conversations' element={<Conversations/>} />
		<Route path='/me/profile' element={<Profile/>} />
	</Routes>
);
}
export default Main;