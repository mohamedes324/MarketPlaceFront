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

const VendorHome = () => {
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    productId: 0,
  });

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
        setProducts(res.data)
      } catch (err) {
        console.log(err);
      }
    };

    fetchAcceptedProducts();
  },[]);


  // best practice APIs.get
  useEffect(() => {
    const fetchVendorPermissions = async () => {
      try {
        const response = await APIs.get(APIs.endpoints.getVendorPermissions)

        if (response.status === 404) {
          console.log("No permissions found for this vendor.");
          setVendorPermissions([]);
        } else if (response.ok) {
          const data = await response.data;
          console.log(data)
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
          <button
            title="View Detiles"
            onClick={() => {
              handleViewButton(product);
            }}
          >
            <FaIcons.FaEye />
          </button>
          <button className={product.canBeUpdated === false ? styles["blur-button"] :""}
            title="Edit"
            onClick={() => {
              handleEditButton(product);
            }}
          >
            <FaIcons.FaEdit />
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function handleDeleteButton(product) {
    const hasDeletePermission = vendorPermissions.some(p => p.permissionId === 4); // 4 = delete permission ID
  
    if (hasDeletePermission) {
      // عنده صلاحية، نفتح الـ alert
      setShowAlert({ status: true, type: "delete", productId: product.id });
    } else {
      // مفيش صلاحية، نظهر رسالة فقط
      Functions.showPopupWithoutReload(
        "You don't have the approval to Delete",
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

  function handleEditButton(product) {
    const hasEditPermission = vendorPermissions.some(p => p.permissionId === 3); // 3 = edit permission ID
    if (!hasEditPermission) {
      setShowAlert({ status: true, type: "edit" });
      Functions.showPopupWithoutReload(
        "You don't have the approval to Edit",
        setPopup
      );
      return;
    }
  
    setFormData({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      categoryId: product.categoryId,
    });

    setShowAlert({ status: true, type: "edit", productId: product.id });

  }

  async function handleViewButton(product) {
    try {
      const response = await fetch(`http://localhost:5161/api/Products/views/${product.id}`, {
        method: "POST",
      });
  
      if (!response.ok) {
        throw new Error("Failed to increase views");
      }
  
      navigate("/ViewDetails", { state: { product } });
  
    } catch (error) {
      Functions.showPopupWithoutReload(`Something went wrong while updating views : ${error}`, setPopup);
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

export default VendorHome;
