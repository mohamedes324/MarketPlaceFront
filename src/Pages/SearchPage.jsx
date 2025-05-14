import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/sidebar";
import Product from "../Components/Product";
import stylesVendor from "./Vendor/VendorHome.module.css";
import styles from "./searchPage.module.css";
import Alert from "../Components/alert";
import { useLocation, useNavigate } from "react-router-dom";
import * as Functions from "../Components/Functions";
import * as FaIcons from "react-icons/fa";
import Popup from "../Components/Popup";
import * as APIs from "../../services/productService";
import ViewDetailsButton from "../Components/productIcons/ViewDetilesButton";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";

const SearchPage = () => {
  const location = useLocation();
  const [value, setValue] = useState([1, 3000]);
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    productId: 0,
  });

  const [originalProducts, setOriginalProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const role = Functions.getUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query") || "";

    setSearchTerm(query);

    if (!query) return;

    const fetchProducts = async () => {
      try {
        const response = await APIs.get(`/api/Products/accepted/${query}`);
        setOriginalProducts(response.data);
        setFilteredProducts(
          response.data.filter(
            (product) => product.price >= value[0] && product.price <= value[1]
          )
        );
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [location.search]);

  const handleRangeChange = (event, newValue) => {
    setValue(newValue);
    const filtered = originalProducts.filter(
      (product) => product.price >= newValue[0] && product.price <= newValue[1]
    );
    setFilteredProducts(filtered);
  };

  const productsArray = filteredProducts.map((product) => (
    <Product key={product.id} product={product}>
      <div className="product-buttons">
        <ViewDetailsButton
          handleViewButton={() => {
            Functions.handleViewButton(product, navigate, setPopup);
          }}
          product={product}
        />
        {role !== "Customer" && role !== null && (
          <button
            className={
              role === "Vendor" && product.canBeDeleted === false
                ? stylesVendor["blur-button"]
                : ""
            }
            title="Delete"
            onClick={() => {
              handleDeleteButton(product);
            }}
          >
            <FaIcons.FaTrash />
          </button>
        )}
      </div>
    </Product>
  ));

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

  return (
    <>
      <Popup show={popup.show} message={popup.message} />

      {showAlert.status && showAlert.type === "delete" && (
        <Alert onClose={() => setShowAlert(false)}>
          <div className={`${popup.show ? "blurred-container" : ""}`}>
            <h1>Are you sure?</h1>
            <div className={stylesVendor.buttons}>
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

        <div className={stylesVendor["sidebar-and-main"]}>
          <Sidebar />
          <div className={stylesVendor.main}>
            <div className={styles.priceRangeContainer}>
              <div className={styles.priceRangeBox}>
                <h3 className={styles.priceRangeTitle}>Select Price Range:</h3>

                <Slider
                  getAriaLabel={() => "Price range"}
                  value={value}
                  onChange={handleRangeChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={3000}
                  step={50}
                  marks={[
                    { value: 0, label: "0" },
                    { value: 500, label: "500" },
                    { value: 1000, label: "1000" },
                    { value: 1500, label: "1500" },
                    { value: 2000, label: "2000" },
                    { value: 3000, label: "3000" },
                  ]}
                  className={styles.priceSlider}
                />

                <p className={styles.priceRangeText}>
                  Your range of Price is between {value[0]} and {value[1]} EGP
                </p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              originalProducts.length === 0 ? (
                <h1 style={{ color: "#FFD700" }}>
                  There are no products or categories with that title
                </h1>
              ) : (
                <h1 style={{ color: "#FFD700" }}>
                  There are no products in that price range
                </h1>
              )
            ) : (
              <>{productsArray}</>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
