import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/sidebar";
import Product from "../Components/Product";
import styles from "./Vendor/VendorHome.module.css";
import styless from "./CompletedOrderProducts.module.css";
import Alert from "../Components/alert";
import { useLocation, useNavigate } from "react-router-dom";
import * as Functions from "../Components/Functions";
import * as FaIcons from "react-icons/fa";
import Popup from "../Components/Popup";
import * as APIs from "../../services/productService";
import ViewDetailsButton from "../Components/productIcons/ViewDetilesButton.jsx";
import EditButton from "../Components/productIcons/EditButton.jsx";
import DeleteButton from "../Components/productIcons/DeleteButton.jsx";
import HistoryButton from "../Components/productIcons/HistoryButton.jsx";
import EditVendor from "../Components/EditVendor.jsx";

const CompletedOrderProducts = () => {
  const location = useLocation();
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    productId: 0,
  });
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    id: 0,
    title: "",
    description: "",
    price: 0,
    quantity: 0,
    categoryId: 0,
  });

  const [vendorPermissions, setVendorPermissions] = useState([]);

  const [products, setProducts] = useState([]);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();
  const { orderId } = location.state;

  // ----------------------------------------------------------------------------------
  const role = Functions.getUserRole();

  // its use here only
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5161/api/Orders/details/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log(data.orderItems);
        const formatted = data.orderItems.map((item) => ({
          id: item.productId,
          imageUrl: `http://localhost:5161/${item.productImageUrl}`,
          title: item.productTitle,
          price: item.productPrice,
          orderItemQuantity: item.orderItemQuantity,
          orderItemTotalPrice: item.orderItemTotalPrice,
        }));

        setProducts(formatted);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // best practice APIs.get
  useEffect(() => {
    const fetchVendorPermissions = async () => {
      try {
        const endpoint = APIs.endpoints.getVendorPermissions(
          Functions.getUserId()
        );
        const response = await APIs.get(endpoint);

        if (response.status === 404) {
          console.log("No permissions found for this vendor.");
          setVendorPermissions([]);
        } else if (response.ok) {
          const data = await response.data;
          setVendorPermissions(data);
        }
      } catch (error) {
        console.error("Error fetching vendor permissions:", error);
      }
    };

    fetchVendorPermissions();
  }, []);

  const productsArray = products.map((product) => {
    return (
      <div className="product">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="product-image"
        />

        <div className="name-product">{product.title}</div>

        <div className={styless["orderItem-info"]}>

          <div className="orderItemQuantity"><span style={{color:"white"}}>Product Quantity:</span> {product.orderItemQuantity}</div>
          <div className="orderItemTotalPrice"><span style={{color:"white"}}>Product total Price:</span> ${product.orderItemTotalPrice}</div>
        </div>

        <div className="product-buttons">
          <ViewDetailsButton
            handleViewButton={() => {
              Functions.handleViewButton(product, navigate, setPopup);
            }}
            product={product}
          />
          {role === "Vendor" && (
            <EditButton
              handleEditButton={() => {
                Functions.handleEditVendorButton(
                  product,
                  vendorPermissions,
                  setPopup,
                  setShowAlert,
                  setFormData
                );
              }}
              product={product}
            />
          )}
          {role !== "Customer" && role !== null && (
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
          {role === "Vendor" && (
            <HistoryButton
              handleHistoryButton={() => {
                Functions.handleHistoryButton(
                  product.id,
                  setPopup,
                  setHistory,
                  setShowAlert
                );
              }}
              productId={product.id}
            />
          )}
        </div>
      </div>
    );
  });

  const historyArray = history.map((order) => {
    return (
      <div className={styles.history} key={order.customerId}>
        <h2
          className={styles["history-title"]}
          onClick={() => {
            handleCustomerOrder(order.customerId);
          }}
        >
          {order.customerName}
        </h2>
        <div className={styles["history-details"]}>
          <h3 className={styles["details-text"]}>
            <span style={{ color: "white" }}>Quantity: </span>
            {order.quantity}
          </h3>
          <h3 className={styles["details-text"]}>
            <span style={{ color: "white" }}>Orderd from: </span>
            {Functions.timeAgo(order.orderedAt)}
          </h3>
        </div>
      </div>
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleCustomerOrder(customerId) {
    navigate("/CompletedOrders", { state: { customerId } });
  }

  return (
    <>
      <Popup show={popup.show} message={popup.message} />

      {showAlert.status && showAlert.type === "history" && (
        <Alert onClose={() => setShowAlert(false)}>{historyArray}</Alert>
      )}

      {showAlert.status &&
        formData.title !== "" &&
        showAlert.type === "edit" && (
          <Alert onClose={() => setShowAlert(false)}>
            <EditVendor
              formData={formData}
              handleChange={handleChange}
              popup={popup}
              setPopup={setPopup}
            />
          </Alert>
        )}
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

export default CompletedOrderProducts;
