import React, { useEffect, useState } from "react";
import Navbar from "../../Components/navbar";
import Product from "../../Components/Product";
import styles from "./WaitingProducts.module.css";
import Sidebar from "../../Components/sidebar";
import Alert from "../../Components/alert";
import * as Functions from "../../Components/Functions";
import { useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import Popup from "../../Components/Popup";

const WaitingProducts = () => {
  // Stats
  const [products, setProducts] = useState([]);
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    productId: 0,
  });

  const [rejectReason, setRejectReason] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token"); // أو حسب مكان حفظك للتوكن
        const response = await fetch(
          `http://localhost:5161/api/Products/all-waiting`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
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
        }));

        setProducts(formatted);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  //  functions
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

  function handleDeleteButton(id) {
    setShowAlert({ status: true, type: "delete", productId: id });
  }

  async function handleAcception(productId) {
    const token = Functions.getToken();
    const adminId = Functions.getUserId();

    if (!token || !adminId) {
      Functions.showPopupWithReload(
        "Missing token or admin ID",
        setPopup
      );
      return;
    }

    const url = `http://localhost:5161/api/Products/status/${productId}`;
    const body = {
      rejectionReason: "Accept",
      status: 1,
      adminCheckedId: adminId,
    };

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      Functions.showPopupWithReload(
        `Product Operation successfully ✅`,
        setPopup
      );
    } catch (error) {
      console.error("Request failed:", error);
    }
  }

  async function handleRejection(productId) {
    const token = Functions.getToken();
    const adminId = Functions.getUserId();

    if (!token || !adminId) {
      console.error("Missing token or admin ID");
      return;
    }

    const url = `http://localhost:5161/api/Products/status/${productId}`;
    const body = {
      rejectionReason: rejectReason,
      status: 2,
      adminCheckedId: adminId,
    };

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      Functions.showPopupWithReload(
        "Product Operation successfully ✅",
        setPopup
      );
    } catch (error) {
      Functions.showPopupWithReload(
        `Request failed: ${error}`,
        setPopup
      );
    }
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
          <button

            title="Delete"
            onClick={() => {
              handleDeleteButton(product.id);
            }}
          >
            <FaIcons.FaTrash />{" "}
          </button>
        </div>
        <button
          className={styles["reject-accept"]}
          onClick={() => {
            handleAcceptButton(product.id);
          }}
        >
          ِAccept
        </button>
        <button
          className={styles["reject-accept"]}
          onClick={() => {
            handleRejectButton(product.id);
          }}
        >
          Reject
        </button>
      </Product>
      // <Product
      //   key={product.id}
      //   product={product}
      // >
      //   <button>View Details</button>
      //   <button
      //     onClick={()=>{handleAcceptButton(product.id)}}
      //   >
      //     ِAccept
      //   </button>
      //   <button onClick={()=>{handleRejectButton(product.id)}}>Reject</button>
      // </Product>
    );
  });

  function handleRejectButton(id) {
    setShowAlert({ status: true, type: "reject", productId: id });
  }

  function handleAcceptButton(id) {
    setShowAlert({ status: true, type: "accept", productId: id });
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

      {showAlert.status && showAlert.type === "reject" && (
        <Alert onClose={() => setShowAlert(false)}>
          <div className={`view-main ${popup.show ? "blurred-container" : ""}`}>
            <h2>Write Your Reject Reason</h2>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <button
              style={{
                display: "block",
                margin: "10px auto",
                padding: "5px",
                width: "20%",
                borderRadius: "10px",
              }}
              onClick={() => handleRejection(showAlert.productId)}
            >
              Yes
            </button>
          </div>
        </Alert>
      )}

      {showAlert.status && showAlert.type === "accept" && (
        <Alert onClose={() => setShowAlert(false)}>
          <div className={`${popup.show ? "blurred-container" : ""}`}>
            <h1>Are you sure?</h1>
            <div className={styles.buttons}>
              <button
                onClick={() => {
                  console.log(showAlert.productId);
                  handleAcception(showAlert.productId);
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
              <h1 style={{color:"#FFD700"}}>There are no waiting products</h1>
            ) : (
              productsArray
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WaitingProducts;
