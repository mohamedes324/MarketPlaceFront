// MainHome.js
import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar";
import Sidebar from "../../Components/sidebar";
import Product from "../../Components/Product";
import * as FaIcons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as Functions from "../../Components/Functions";
import Popup from "../../Components/Popup";
import * as APIs from "../../../services/productService.js";
import "../main.css";
import ViewDetailsButton from "../../Components/productIcons/ViewDetilesButton.jsx";

function MainHome() {
  const [products, setProducts] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // this use new APIs.get
  useEffect(() => {
    const fetchAcceptedProducts = async () => {
      try {
        const res = await APIs.get(APIs.endpoints.getAcceptProducts);
        setProducts(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAcceptedProducts();
  }, []);

  const productsArray = products.map((product) => {
    return (
      <Product key={product.id} product={product}>
        <div className="product-buttons">
          <ViewDetailsButton
            handleViewButton={() => {
              Functions.handleViewButton(product, navigate, setPopup);
            }}
            product={product}
          />{" "}
        </div>
      </Product>
    );
  });

  return (
    <>
      <Popup show={popup.show} message={popup.message} />

      <div className={`${popup.show ? "blurred-container" : ""}`}>
        <Navbar />

        <div className="sidebar-and-main">
          <Sidebar />

          <div className="main">{productsArray}</div>
        </div>
      </div>
    </>
  );
}

export default MainHome;
