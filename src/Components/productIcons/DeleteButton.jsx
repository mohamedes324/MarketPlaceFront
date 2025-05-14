import React from 'react'
import * as FaIcons from "react-icons/fa";
import styles from "../../Pages/Vendor/VendorHome.module.css";

const DeleteButton = ({handleDeleteButton , product}) => {
  return (
    <button
    className={
      product.canBeDeleted === false ? styles["blur-button"] : ""
    }
    title="Delete"
    onClick={() => {
      handleDeleteButton(product);
    }}
  >
    <FaIcons.FaTrash />{" "}
  </button>
  )
}

export default DeleteButton
