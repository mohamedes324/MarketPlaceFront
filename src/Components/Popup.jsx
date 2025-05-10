import React from "react";

const Popup = ({ show, message}) => {
    if (!show) return null;

    return (
        <div className={`popup slide-down`}>
            {message}
        </div>
    );
};

export default Popup;
