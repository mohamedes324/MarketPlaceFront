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

function MainHome() {

 const [products, setProducts] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

    useEffect(() => {
      const fetchProducts = async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(
            "http://localhost:5161/api/Products/accepted",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          console.log(data)
          const formatted = data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            imageUrl: `http://localhost:5161/${item.imageUrl}`,
            quantity: item.quantity,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            createdAt: item.createdAt,
            vendorName: item.vendorName,
            viewsNumber: item.viewsNumber,
            isSaved: item.isSaved,
            canBuy: item.canBuy,
            isInCart: item.isInCart
          }));
          console.log(formatted)
          setProducts(formatted);
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };
  
      fetchProducts();
    }, []);

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
