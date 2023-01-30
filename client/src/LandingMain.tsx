import { Routes, Route } from 'react-router-dom';
import DevAreWorking from './components/DevAreWorking/DevAreWorking';
import Loading from './components/main/loading/Loading';
import Landing from './screens/landing/Landing';
import Login from './screens/log/login/Login';
import Register from './screens/log/register/Register';
import Oauth from './screens/oauth/Oauth';


/**
 *	React Component
 *	Describe the different possible routes and UI rendered consequently.
 */
const LandingMain = () => {
return (         
	<Routes>
		<Route path='/' element={<Landing/>} />
		<Route path='/login' element={<Login/>} />
		<Route path='/register' element={<Register/>} />
		<Route path='/oauth' element={<Oauth/>} />
		<Route path='*' element={<Loading/>} />
	</Routes>
);
}
export default LandingMain;