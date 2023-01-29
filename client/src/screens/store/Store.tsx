import { Button } from '@mui/material';
import React, { useContext } from 'react'
import { AuthContext, ToastContext } from '../..';
import { TOAST_LVL } from '../../constants/constants';
import { store_items } from '../../constants/store_items'
import "./style.scss"
import axios from "../../service/axios"

type Item = {
	item?: any;
	type?: string ;
}

type k = keyof typeof store_items;

const Store = () => {

	const {user, profile} = useContext(AuthContext);
	const {set_toast} = useContext(ToastContext);

	const RenderItem = (item_props: Item) => {
		const item = item_props.item;

		if (item_props.type == "ball") {
			return (
				<div className={`ball ${item.type}`} style={{backgroundColor: item.color == "rainbow" ? "#ff0000" : item.color}}>

				</div>
			)
		}

		if (item.type == "change") {
			return (
				<div className={`pad change ${item.color == "rainbow" ? "rainbow" : ""}`} style={{backgroundColor: item.color == "rainbow" ? "#ff0000" : "#fff"}}>
	
				</div>
			)
		}

		if (item.type == "dotted") {
			return (
				<div className={`pad dotted ${item.color == "invisible" ? "spec" : ""}`} style={{borderColor: item.color == "invisible" ? "#fff" : item.color}}>
	
				</div>
			)
		}
		
		return (
			<div className={`pad ${item.color == "invisible" ? "spec" : ""}`} style={{backgroundColor: item.color == "invisible" ? "#fff" : item.color}}>

			</div>
		)
	}

	const buy = async (type: string, key: string, price: number) => {
		if (user.coins < price) {
			set_toast(TOAST_LVL.ERROR, "Not enough coins", "You don't have enough coins to afford this article.");
			return;
		}
		const yet_pads: any[] = user.store.pads == undefined ? [] : user.store.pads;
		const yet_ball: any[] = user.store.balls == undefined ? [] : user.store.balls;
		if (type == "ball") {
			yet_ball.push(key);
		} else {
			yet_pads.push(key);
		}
		const new_custom = {
			pads: yet_pads,
			balls: yet_ball,
			selected_ball: user.store.selected_ball,
			selected_pad: user.store.selected_pad
		}
		const ret = await axios.put("/user/customize", {
			coins: user.coins - price,
			custom: JSON.stringify(new_custom),
		})
		await profile(user.token);
	}

	const select = async (type: string, key: string) => {
		const new_custom = {
			pads: user.store.pads,
			balls: user.store.balls,
			selected_ball: type == "ball" ? key : user.store.selected_ball,
			selected_pad: type == "pad" ? key : user.store.selected_pad
		}
		const ret = await axios.put("/user/customize", {
			coins: user.coins,
			custom: JSON.stringify(new_custom),
		})
		await profile(user.token);
	}

	return (
		<div id="store" className='main-view'>
			<div className='store-header'>
				<h1>Store</h1>
				<div className='money'>
					<i className="fas fa-coins"></i>
					<span>{user.coins}</span>
				</div>
			</div>
			<div className='store-part'>
				<h2>Balls</h2>
				<div className='store-part-container'>
					{
						Object.keys(store_items.balls).map((elem: string, id: number) => {
							const item = store_items.balls[elem];
							return (
								<div key={id} className='store-item'>
									<div className='item-image'>
										<RenderItem item={item} type="ball" />
									</div>
									<h4>
										{item.description}
									</h4>
									<div className='price'>
										<i className="fas fa-coins"></i>
										<span>{item.price.toFixed(2)}</span>
									</div>
									{
										user.store.selected_ball == elem ?
										<Button onClick={() => select("ball", elem)} disabled={true} variant='outlined'>Selected</Button>:
										user.store.balls.includes(elem) ? 
										<Button onClick={() => select("ball", elem)} variant='outlined'>Select</Button>
										:
										<Button onClick={() => buy("ball", elem, item.price)} variant='contained'>Buy</Button>
									}
								</div>
							)
						})
					}
				</div>
			</div>
			<div className='store-part'>
				<h2>Pads</h2>
				<div className='store-part-container'>
					{
						Object.keys(store_items.pads).map((elem: string, id: number) => {
							const item = store_items.pads[elem];
							return (
								<div key={id} className='store-item'>
									<div className='item-image'>
										<RenderItem item={item} type="pad" />
									</div>
									<h4>
										{item.description}
									</h4>
									<div className='price'>
										<i className="fas fa-coins"></i>
										<span>{item.price.toFixed(2)}</span>
									</div>
									{
										user.store.selected_pad == elem ?
										<Button onClick={() => select("pad", elem)} disabled={true} variant='outlined'>Selected</Button>:
										user.store.pads.includes(elem) ? 
										<Button onClick={() => select("pad", elem)} variant='outlined'>Select</Button>
										:
										<Button onClick={() => buy("pad", elem, item.price)} variant='contained'>Buy</Button>
									}
								</div>
							)
						})
					}
				</div>
			</div>
		</div>
	)
}

export default Store