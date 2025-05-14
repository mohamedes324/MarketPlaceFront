import React from 'react'
import * as FaIcons from "react-icons/fa";

const HistoryButton = ({handleHistoryButton , productId}) => {
  return (
    <button
    title="History"
    onClick={() => {
        handleHistoryButton(productId);
    }}
  >
    <FaIcons.FaHistory />{" "}
  </button>
  )
}

export default HistoryButton
