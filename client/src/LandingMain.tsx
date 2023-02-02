import { Routes, Route } from 'react-router-dom';
import DevAreWorking from './components/DevAreWorking/DevAreWorking';
import Loading from './components/main/loading/Loading';
import Landing from './screens/landing/Landing';
import Login from './screens/log/login/Login';
import Register from './screens/log/register/Register';
import Oauth from './screens/oauth/Oauth';
import Oauth2fa from './screens/oauth/Oauth2fa';


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
		<Route path='/oauth-2fa' element={<Oauth2fa/>} />
		<Route path='*' element={<Landing/>} />
	</Routes>
);
}
export default LandingMain;