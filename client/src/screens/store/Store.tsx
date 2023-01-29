import { Button } from '@mui/material';
import React from 'react'
import { store_items } from '../../constants/store_items'
import "./style.scss"

type Item = {
	item?: any;
	type?: string ;
}

type k = keyof typeof store_items;

const Store = () => {

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

	return (
		<div id="store" className='main-view'>
			<div className='store-header'>
				<h1>Store</h1>
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
									<Button variant='contained'>Buy</Button>
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
									<Button variant='contained'>Buy</Button>
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