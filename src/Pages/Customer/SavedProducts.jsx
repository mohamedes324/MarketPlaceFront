import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar";
import Sidebar from "../../Components/sidebar";
import styles from "./customerHome.module.css";
import Product from "../../Components/Product";
import Alert from "../../Components/alert";
import * as FaIcons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import EditVendor from "../../Components/EditVendor";
import * as Functions from "../../Components/Functions";
import Popup from "../../Components/Popup";
import * as APIs from "../../../services/productService.js";
import ViewDetailsButton from "../../Components/productIcons/ViewDetilesButton.jsx";

const SavedProducts = () => {
  const [savedProducts, setSavedProducts] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // this use new APIs.get and best practice
  // this use new APIs.get and best practice
  const fetchSavedProducts = async () => {
    try {
      const res = await APIs.get(APIs.endpoints.getSavedProducts);

      console.log(res.data);
      setSavedProducts(res.data);
    } catch (error) {
      console.error("Error fetching saved products:", error);
    }
  };

  useEffect(() => {
    fetchSavedProducts();
  }, []);
  //-------------------------------------------------------------------------------------------------

  const productsArray = savedProducts.map((product) => {
    return (
      <Product key={product.id} product={product}>
        <div className="product-buttons">
          <ViewDetailsButton
            handleViewButton={() => {
              Functions.handleViewButton(product, navigate, setPopup);
            }}
            product={product}
          />{" "}
          {product.isSaved ? (
            <button
              onClick={() => handleRemoveFromSaved(product.id)}
              key={product.id}
            >
              <FaIcons.FaHeart />
            </button>
          ) : (
            <button
              onClick={() => handleAddToSaved(product.id, product.isSaved)}
              key={product.id}
            >
              <FaIcons.FaRegHeart />
            </button>
          )}
        </div>
      </Product>
    );
  });

    // APIs.post
    const handleAddToSaved = async (productId) => {
      try {
        const response = await APIs.post(
          `${APIs.endpoints.postSavedProducts}${productId}`
        );
  
        if (!response.ok) {
          throw new Error("Failed to add product to saved");
        }
  
        setSavedProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId ? { ...product, isSaved: true } : product
          )
        );
        await fetchSavedProducts();
      } catch (error) {
        console.error("Error adding product to saved:", error);
      }
    };

    const handleRemoveFromSaved = async (productId) => {
      const savedProduct = savedProducts.find(
        (product) => product.id === Number(productId)
      );
    
      if (!savedProduct) {
        console.log("Product not found in savedProducts:", productId);
        return;
      }
    
      try {
        const token = localStorage.getItem("token");
    
        if (!token) {
          console.log("Token is missing in localStorage.");
          return;
        }
    
        const response = await fetch(
          `http://localhost:5161/api/SavedProducts/${savedProduct.saveId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
    
        if (response.ok) {
          // حذف المنتج من الواجهة بعد تأكيد الحذف من السيرفر
          setSavedProducts((prev) =>
            prev.filter((product) => product.saveId !== savedProduct.saveId)
          );
        } else {
          const errorData = await response.json();
          console.log("Failed to delete product. Error details:", errorData);
        }
      } catch (error) {
        console.error("Error removing product from saved:", error);
      }
    };
    
  return (
    <>
      <Popup show={popup.show} message={popup.message} />
      <div>
        <Navbar />

        <div className={styles["sidebar-and-main"]}>
          <Sidebar />

          <div className={styles.main}>
            {productsArray.length === 0 ? (
              <h1 style={{ color: "#FFD700" }}>
                There aren't any saved products
              </h1>
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
