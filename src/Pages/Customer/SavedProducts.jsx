import React, { useEffect, useState } from "react";
import Navbar from "../../Components/navbar";
import Sidebar from "../../Components/sidebar";
import styles from "./customerHome.module.css";
import Product from "../../Components/Product";
import Alert from "../../Components/alert";
import * as FaIcons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import EditVendor from "../../Components/EditVendor";
import * as Functions from "../../Components/Functions";
import Popup from "../../Components/Popup";

const SavedProducts = () => {
  const [products, setProducts] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedProducts = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5161/api/SavedProducts",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        console.log(data);
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

        setProducts(formatted);
      } catch (error) {
        console.error("Error fetching saved products:", error);
      }
    };

    fetchSavedProducts();
  }, []);

  //-------------------------------------------------------------------------------------------------

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
      <div>
        <Navbar />

        <div className={styles["sidebar-and-main"]}>
          <Sidebar />

          <div className={styles.main}>
            {productsArray.length === 0 ? (
              <h1>There aren't any saved products</h1>
            ) : (
              productsArray
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SavedProducts;
