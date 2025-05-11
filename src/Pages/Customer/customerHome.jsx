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

const CustomerHome = () => {
  const [products, setProducts] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [savedProducts, setSavedProducts] = useState([]);

  const navigate = useNavigate();

  // ----------------------------------------------------------------------------------

  // this use new APIs.get and best practice
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

  
  // this use new APIs.get and best practice
  const fetchSavedProducts = async () => {
    try {
      const res = await APIs.get(APIs.endpoints.getSavedProducts)

      console.log(res.data)
      setSavedProducts(res.data);
    } catch (error) {
      console.error("Error fetching saved products:", error);
    }
  };

  useEffect(() => {
    fetchSavedProducts();
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

  const handleAddToSaved = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5161/api/SavedProducts/${productId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add product to saved");
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, isSaved: true } : product
        )
      );
      // await fetchSavedProducts();
    } catch (error) {
      console.error("Error adding product to saved:", error);
    }
  };

  const handleRemoveFromSaved = async (productId) => {

    const savedProduct = savedProducts.find(
      (product) => {
        return product.id === Number(productId);
      } // استخدام id بدلًا من productId
    );

    if (!savedProduct) {
      console.log("Product not found in savedProducts:", productId);
      return; // لو مش لاقي المنتج، نوقف العملية
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("Token is missing in localStorage.");
        return;
      }
      
      const response = await fetch(
        `http://localhost:5161/api/SavedProducts/${savedProduct.saveId}`, // تعديل الـ API ليتوافق مع saveId
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {

        await fetchSavedProducts();
        // بعد الحذف، نحدث الـ UI عن طريق إزالة المنتج من state
        setSavedProducts(
          (prev) =>
            prev.filter((product) => product.saveId !== savedProduct.saveId) // تعديل الحذف بناءً على saveId
        );

        // نحدث حالة الـ products ونسحب القيم المحدثة للـ products
        setProducts((prevProducts) =>
          prevProducts.map(
            (product) =>
              product.id === productId
                ? { ...product, isSaved: false }
                : product // تحديث الـ isSaved بعد الحذف
          )
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

        <div className={`${popup.show ? "blurred-container" : ""}`}>
          <Navbar />

          <div className={styles["sidebar-and-main"]}>
            <Sidebar />

            <div className={styles.main}>{productsArray}</div>
          </div>
        </div>
    </>
  );
};

export default CustomerHome;
