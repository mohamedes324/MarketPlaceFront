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

const SavedProducts = () => {
  const [products, setProducts] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // this use new APIs.get and best practice
  useEffect(() => {
    const fetchSavedProducts = async () => {
      try {
        const res = await APIs.get(APIs.endpoints.getSavedProducts);
  
        setProducts(res.data);
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
              <h1 style={{color:"#FFD700"}}>There aren't any saved products</h1>
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
