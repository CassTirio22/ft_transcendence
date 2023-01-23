
import { Routes, Route } from 'react-router-dom';
import DevAreWorking from './components/DevAreWorking/DevAreWorking';
import Loading from './components/main/loading/Loading';
import Conversations from './screens/conversations/Conversations';
import Friends from './screens/friends/Friends';
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
		<Route path='/' element={<DevAreWorking/>} />
		<Route path='/conversations' element={<Conversations/>} />
		<Route path='/conversations/channel/:channel_id' element={<Conversations/>} />
		<Route path='/conversations/direct/:direct_id' element={<Conversations/>} />
		<Route path='/friends' element={<Friends/>} />
		<Route path='/play' element={<DevAreWorking/>} />
		<Route path='/watch' element={<DevAreWorking/>} />
		<Route path='/me/profile' element={<Profile/>} />
		<Route path='*' element={<Loading/>} />
	</Routes>
);
}
export default Main;