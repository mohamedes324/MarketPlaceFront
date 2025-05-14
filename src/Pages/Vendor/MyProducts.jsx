import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar.jsx";
import Sidebar from "../../Components/sidebar";
import styles from "./MyProducts.module.css";
import Product from "../../Components/Product";
import * as Functions from "../../Components/Functions";
import Alert from "../../Components/alert";
import * as FaIcons from "react-icons/fa";
import Popup from "../../Components/Popup";
import EditVendor from "../../Components/EditVendor";
import * as APIs from "../../../services/productService.js";
import ViewDetailsButton from "../../Components/productIcons/ViewDetilesButton.jsx";
import EditButton from "../../Components/productIcons/EditButton.jsx";
import DeleteButton from "../../Components/productIcons/DeleteButton.jsx";
import HistoryButton from "../../Components/productIcons/HistoryButton.jsx";

const MyProducts = () => {
  // I must get the id of the vendor and go to products database to get myProducts
  const [history, setHistory] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [myProducts, setMyProducts] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [vendorPermissions, setVendorPermissions] = useState([]);

  const [formData, setFormData] = useState({
    id: 0,
    title: "",
    description: "",
    price: 0,
    quantity: 0,
    categoryId: 0,
  });

  const navigate = useNavigate();

  // best practice APIs.get
  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const response = await APIs.get(APIs.endpoints.getMyProducts);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        setMyProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchMyProducts();
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

  const productsArray = myProducts.map((product) => {
    return (
      <Product key={product.id} product={product}>
        <h3
          style={{
            color:
              product.approvalStatus === 0
                ? "#FFA500"
                : product.approvalStatus === 1
                ? "#32CD32"
                : product.approvalStatus === 2
                ? "#FF6347"
                : "#000",
          }}
        >
          <span className={styles.status}>Status:</span>{" "}
          {product.approvalStatus === 0
            ? "Waiting..."
            : product.approvalStatus === 1
            ? "Accepted"
            : product.approvalStatus === 2
            ? "Rejected"
            : "Unknown"}
        </h3>
        <div className="product-buttons">
          <ViewDetailsButton
            handleViewButton={() => {
              Functions.handleViewButton(product, navigate, setPopup);
            }}
            product={product}
          />
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
          <DeleteButton
            handleDeleteButton={() => {
              Functions.handleDeleteVendorButton(
                product,
                vendorPermissions,
                setPopup,
                setShowAlert
              );
            }}
            product={product}
          />
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
        </div>
      </Product>
    );
  });

  //--------------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  async function handleCustomerOrder(customerId) {
    navigate("/CompletedOrders", { state: { customerId } });
  }

  return (
    <>
      <Popup show={popup.show} message={popup.message} />

      {showAlert.status && showAlert.type === "history" && (
        <Alert onClose={() => setShowAlert(false)}>{historyArray}</Alert>
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

export default MyProducts;
