// MainHome.js
import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar";
import Sidebar from "../../Components/sidebar";
import Product from "../../Components/Product";
import * as FaIcons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as Functions from "../../Components/Functions";
import Popup from "../../Components/Popup";
import "./MainHome.css"
import * as APIs from "../../../services/productService.js";

function MainHome() {

 const [products, setProducts] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // this use new APIs.get
  useEffect(() => {
    const fetchAcceptedProducts = async () => {
      try {
        const res = await APIs.get(APIs.endpoints.getAcceptProducts);
        setProducts(res.data)
      } catch (err) {
        console.log(err);
      }
    };

    fetchAcceptedProducts();
  },[]);

  const productsArray = products.map((product) => {
    return (
      <Product key={product.id} product={product}>
        <div className="product-buttons">
          <button
            title="View Detiles"
            onClick={() => {
              handleViewButton(product);
            }}
          >
            <FaIcons.FaEye />
          </button>
          
          <button title="History">
            <FaIcons.FaHistory />{" "}
          </button>
        </div>
    
      </Product>
    );
  });

  async function handleViewButton(product) {
    try {
      const response = await fetch(
        `http://localhost:5161/api/Products/views/${product.id}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to increase views");
      }

      navigate("/ViewDetails", { state: { product } });
    } catch (error) {
      Functions.showPopupWithoutReload(
        `Something went wrong while updating views : ${error}`,
        setPopup
      );
    }
  }

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
