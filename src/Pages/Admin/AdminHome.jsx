import { useEffect, useState } from "react";
import Navbar from "../../Components/navbar";
import Sidebar from "../../Components/sidebar";
import styles from "./adminHome.module.css";
import Product from "../../Components/Product";
import Popup from "../../Components/Popup";
import Alert from "../../Components/alert";
import * as Functions from "../../Components/Functions";
import { useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";

const AdminHome = () => {
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    ProductId: 0,
  });

  const [myProducts, setMyProducts] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const response = await fetch(
          `http://localhost:5161/api/Products/accepted`,
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
          canBeDeleted: item.canBeDeleted,
          canBeUpdated: item.canBeUpdated,
          createdAt: item.createdAt,
          vendorName: item.vendorName,
          viewsNumber: item.viewsNumber,
        }));

        setMyProducts(formatted);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

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

          <button className={product.canBeDeleted === false ? styles["blur-button"] :""}
            title="Delete"
            onClick={() => {
              handleDeleteButton(product);
            }}
          >
            <FaIcons.FaTrash />{" "}
          </button>
          <button title="History" >
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
