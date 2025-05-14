import React from "react";
import * as FaIcons from "react-icons/fa";

const ViewDetiles = ({handleViewButton , productId}) => {
  return (
    <button
      title="View Detiles"
      onClick={() => {
        handleViewButton(productId);
      }}
    >
      <FaIcons.FaEye />
    </button>
  );
};

export default ViewDetiles;
