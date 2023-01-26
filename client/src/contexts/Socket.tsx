

import React from 'react'

type Props = {
	children?: JSX.Element
}

const Socket: React.FC<Props> = (props: Props) => {
  return (
    <>
    {props.children}
    </>
  )
}

export default Socket