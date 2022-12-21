import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { mapDispatchToProps, mapStateToProps } from '../../store/dispatcher'
import "./style.scss"

type Props = {
	messages?: any;
	fetchMessages?: any;
};

type Message = {
	content: string
}

const Home: React.FC<Props> = (props: Props) => {
	useEffect(() => {
		props.fetchMessages(1);
	}, [])

	return (
		<div className='test'>
			{
				props.messages.map((elem: Message, id:number) => (
					<div key={id}>
						{elem.content}
					</div>
				))
			}
		</div>
	)
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)