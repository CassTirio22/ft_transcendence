

import React, { useRef } from 'react'
import { io } from "socket.io-client";

type Props = {
	children?: JSX.Element
}

const Socket: React.FC<Props> = (props: Props) => {

	const socket = useRef<any | null>(null);

	return (
		<>
		{props.children}
		</>
	)
}

export default Socket