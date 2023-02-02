
import { Routes, Route } from 'react-router-dom';
import ChannelInfo from './components/conversations/channel_info/ChannelInfo';
import DevAreWorking from './components/DevAreWorking/DevAreWorking';
import Loading from './components/main/loading/Loading';
import Conversations from './screens/conversations/Conversations';
import Friends from './screens/friends/Friends';
import Game from './screens/game/Game';
import GameMatching from './screens/game_matching/GameMatching';
import Home from './screens/home/Home';
import DoubleAuth from './screens/profile/2fa/DoubleAuth';
import Profile from './screens/profile/Profile';
import Ranking from './screens/ranking/Ranking';
import Store from './screens/store/Store';
import Users from './screens/users/Users';
import WatchGame from './screens/watch_game/WatchGame';
/**
 *	React Component
 *	Describe the different possible routes and UI rendered consequently.
 */
const Main = () => {
return (         
	<Routes>
		<Route path='/' element={<Home/>} />
		<Route path='/conversations' element={<Conversations/>} />
		<Route path='/conversations/channel/:channel_id' element={<Conversations/>} />
		<Route path='/conversations/channel/:channel_id/infos' element={<ChannelInfo/>} />
		<Route path='/conversations/direct/:direct_id' element={<Conversations/>} />
		<Route path='/friends' element={<Friends/>} />
		<Route path='/store' element={<Store/>} />
		<Route path='/play' element={<GameMatching/>} />
		<Route path='/users/:player_id' element={<Users/>} />
		<Route path='/play/:game_id' element={<Game/>} />
		<Route path='/watch' element={<WatchGame/>} />
		<Route path='/ranking' element={<Ranking/>} />
		<Route path='/me/profile' element={<Profile/>} />
		<Route path='/me/profile/2fa-activation' element={<DoubleAuth/>} />
		<Route path='*' element={<Loading/>} />
	</Routes>
);
}
export default Main;