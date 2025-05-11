import { useEffect, useState } from "react";
import Sidebar from "../../Components/sidebar";
import styles from "./adminHome.module.css";
import Product from "../../Components/Product";
import Popup from "../../Components/Popup";
import Alert from "../../Components/alert";
import * as Functions from "../../Components/Functions";
import { useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import * as APIs from "../../../services/productService.js";
import Navbar from "../../Components/Navbar.jsx";

const AdminHome = () => {
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    ProductId: 0,
  });

  const [myProducts, setProducts] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  //--------------------------------------------------------------------------------

  // this use new APIs.get
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

  const productsArray = myProducts.map((product) => {
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
            className={
              product.canBeDeleted === false ? styles["blur-button"] : ""
            }
            title="Delete"
            onClick={() => {
              handleDeleteButton(product);
            }}
          >
            <FaIcons.FaTrash />{" "}
          </button>
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

          <div className={styles.main}>{productsArray}</div>
        </div>
      </div>
    </>
  );
};

export default AdminHome;
