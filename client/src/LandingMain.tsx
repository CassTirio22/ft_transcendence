import { Routes, Route } from 'react-router-dom';
import DevAreWorking from './components/DevAreWorking/DevAreWorking';
import Landing from './screens/landing/Landing';
import Login from './screens/log/login/Login';
import Register from './screens/log/register/Register';


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
		<Route path='*' element={<DevAreWorking/>} />
	</Routes>
);
}
export default LandingMain;