import React from 'react'
import dev_are_workings from "../../assets/images/dev-are-working.svg"
import "./style.scss"

const DevAreWorking = () => {
  return (
    <div id="dev-are-working">
      <img src={dev_are_workings} />
      <h1>Devs are working...</h1>
    </div>
  )
}

export default DevAreWorking