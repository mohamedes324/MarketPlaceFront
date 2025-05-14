import React from 'react'
import * as FaIcons from "react-icons/fa";
import styles from "../../Pages/Vendor/VendorHome.module.css";

const EditButton = ({handleEditButton , product}) => {
  return (
          <button
            className={
              product.canBeUpdated === false ? styles["blur-button"] : ""
            }
            title="Edit"
            onClick={() => {
              handleEditButton(product);
            }}
          >
            <FaIcons.FaEdit />
          </button>
  )
}

export default EditButton
