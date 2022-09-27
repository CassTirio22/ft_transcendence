import { Routes, Route } from 'react-router-dom';
import Login from './screens/log/login';
import Register from './screens/log/register';

const Main = () => {
return (         
	<Routes>
		<Route path='/' element={<Login/>} />
		<Route path='/login' element={<Login/>} />
		<Route path='/register' element={<Register/>} />
	</Routes>
);
}
export default Main;