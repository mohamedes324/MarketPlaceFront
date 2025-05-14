import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/sidebar";
import styles from "./VendorHome.module.css";
import Product from "../../Components/Product";
import Alert from "../../Components/alert";
import * as FaIcons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import EditVendor from "../../Components/EditVendor";
import * as Functions from "../../Components/Functions";
import Popup from "../../Components/Popup";
import Navbar from "../../Components/Navbar";
import * as APIs from "../../../services/productService.js";
import ViewDetailsButton from "../../Components/productIcons/ViewDetilesButton.jsx";
import EditButton from "../../Components/productIcons/EditButton.jsx";
import DeleteButton from "../../Components/productIcons/DeleteButton.jsx";
import HistoryButton from "../../Components/productIcons/HistoryButton.jsx";

const VendorHome = () => {
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    productId: 0,
  });
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendorPermissions, setVendorPermissions] = useState([]);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({
    id: 0,
    title: "",
    description: "",
    price: 0,
    quantity: 0,
    categoryId: 0,
  });
  const navigate = useNavigate();

  // ----------------------------------------------------------------------------------

  // this use new APIs.get and best practice
  useEffect(() => {
    const fetchAcceptedProducts = async () => {
      try {
        const res = await APIs.get(APIs.endpoints.getAcceptProducts);
        setProducts(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAcceptedProducts();
  }, []);

  // best practice APIs.get
  useEffect(() => {
    const fetchVendorPermissions = async () => {
      try {
        const vendorId = Functions.getUserId();
        const endpoint = APIs.endpoints.getVendorPermissions(vendorId);
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
      <Product key={product.id} product={product}>
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

  // this use new APIs.post
  // async function handleViewButton(product) {
  //   try {
  //     const response = await APIs.post(
  //       `${APIs.endpoints.postViewProduct}${product.id}`
  //     );

  //     // المفروض انو بيرجع علي هيئة نص عادي
  //     if (!response.ok) {
  //       throw new Error(`${response.data}`);
  //     }

  //     navigate("/ViewDetails", { state: { product } });
  //   } catch (error) {
  //     Functions.showPopupWithoutReload(
  //       `Something went wrong while updating views : ${error}`,
  //       setPopup
  //     );
  //   }
  // }

  // async function handleHistoryButton(productId) {
  //   const endpoint = APIs.endpoints.getProductHistory(productId);
  //   const res = await APIs.get(endpoint);

  //   if (res.status === 403) {
  //     Functions.showPopupWithoutReload("You don't have the approval", setPopup);
  //     return;
  //   } else if (!res.ok) {
  //     Functions.showPopupWithoutReload(res.data, setPopup);
  //     return;
  //   }
  //   setHistory(res.data);
  //   setShowAlert({ status: true, type: "history", productId: productId });
  // }

  async function handleCustomerOrder(customerId) {
    navigate("/CompletedOrders", { state: { customerId } });
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

      {showAlert.status && showAlert.type === "history" && (
        <Alert onClose={() => setShowAlert(false)}>{historyArray}</Alert>
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

export default VendorHome;
