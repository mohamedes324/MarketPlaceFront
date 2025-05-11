import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/sidebar";
import Product from "../Components/Product";
import styles from "./Vendor/VendorHome.module.css";
import Alert from "../Components/alert";
import { useLocation, useNavigate } from "react-router-dom";
import * as Functions from "../Components/Functions";
import * as FaIcons from "react-icons/fa";
import Popup from "../Components/Popup";

const ProductsOfCategory = () => {
  const location = useLocation();
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    productId: 0,
  });

  const [products, setProducts] = useState([]);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();
  const categoryId = location.state;

  // ----------------------------------------------------------------------------------
  const role = Functions.getUserRole();

  // its use here only
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5161/api/Products/accepted/category/id/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        const formatted = data.map((item) => ({...item,
          imageUrl: `http://localhost:5161/${item.imageUrl}`,
        }));

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
          {role !== "Customer" && (
            <button
              className={
                role === "Vendor" && product.canBeDeleted === false
                  ? styles["blur-button"] 
                  : ""
              }
              title="Delete"
              onClick={() => {
                handleDeleteButton(product);
              }}
            >
              <FaIcons.FaTrash />{" "}
            </button>
          )}
          <button title="History">
            <FaIcons.FaHistory />{" "}
          </button>
        </div>
      </Product>
    );
  });

  function handleDeleteButton(product) {
    setShowAlert({ status: true, type: "delete", productId: product.id });
  }

  async function handleDeletion(id) {
    try {
      const response = await fetch(`http://localhost:5161/api/Products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Functions.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete the product");
      }
      Functions.showPopupWithReload(
        "Product deleted successfully ✅",
        setPopup
      );
    } catch (error) {
      Functions.showPopupWithoutReload(error, setPopup);
    }
  }

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

      {showAlert.status && showAlert.type === "delete" && (
        <Alert onClose={() => setShowAlert(false)}>
          <div className={`${popup.show ? "blurred-container" : ""}`}>
            <h1>Are you sure?</h1>
            <div className={styles.buttons}>
              <button
                onClick={() => {
                  handleDeletion(showAlert.productId);
                }}
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowAlert({ ...showAlert, status: false });
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Alert>
      )}

      <div className={`${popup.show ? "blurred-container" : ""}`}>
        <Navbar />

        <div className={styles["sidebar-and-main"]}>
          <Sidebar />

          <div className={styles.main}>
            {productsArray.length === 0 ? (
              <h1 style={{ color: "#FFD700" }}>There are no products </h1>
            ) : (
              productsArray
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsOfCategory;
