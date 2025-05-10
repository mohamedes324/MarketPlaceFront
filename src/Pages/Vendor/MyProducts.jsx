import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/navbar";
import Sidebar from "../../Components/sidebar";
import styles from "./MyProducts.module.css";
import Product from "../../Components/Product";
import * as Functions from "../../Components/Functions";
import Alert from "../../Components/alert";

import { getUserId } from "../../Components/Functions";
import * as FaIcons from "react-icons/fa";
import Popup from "../../Components/Popup";
import EditVendor from "../../Components/EditVendor";

const MyProducts = () => {
  // I must get the id of the vendor and go to products database to get myProducts

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

  const vendorId = getUserId();

  const role = Functions.getUserRole();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token"); // أو حسب مكان حفظك للتوكن
        const response = await fetch(
          `http://localhost:5161/api/Products/all/vendor/${vendorId}`,
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
        console.log(data); // هذا سيساعدك في رؤية بنية الـ JSON التي تأتي من السيرفر

        const formatted = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          imageUrl: `http://localhost:5161/${item.imageUrl}`,
          quantity: item.quantity,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          vendorName: item.vendorName,
          canBeDeleted: item.canBeDeleted,
          canBeUpdated: item.canBeUpdated,
          approvalStatus: item.approvalStatus,
          createdAt: item.createdAt,
          viewsNumber: item.viewsNumber,
          rejectionReason: item.rejectionReason,
        }));

        console.log(formatted);
        setMyProducts(formatted);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchVendorPermissions = async () => {
      try {
        const response = await fetch(
          `http://localhost:5161/api/VendorPermissions/${Functions.getUserId()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 404) {
          // لو رجع 404 معناها مفيش صلاحيات للـ Vendor
          console.log("No permissions found for this vendor.");
          setVendorPermissions([]); // مفيش صلاحيات نعرضهم فاضي
        } else if (response.ok) {
          const data = await response.json();
          console.log("Vendor Permissions:", data);
          setVendorPermissions(data);
        }
      } catch (error) {
        console.error("Error fetching vendor permissions:", error);
      }
    };

    fetchVendorPermissions();
  }, []);

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
          <button
            title="View Detiles"
            onClick={() => {
              handleViewButton(product);
            }}
          >
            <FaIcons.FaEye className="icon" />
          </button>
          <button
            title="Edit"
            onClick={() => {
              handleEditButton(product);
            }}
          >
            <FaIcons.FaEdit />
          </button>
          <button
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

  //--------------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function handleDeleteButton(product) {
    const hasDeletePermission = vendorPermissions.some(
      (p) => p.permissionId === 4
    ); // 4 = delete permission ID

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
    const hasEditPermission = vendorPermissions.some(
      (p) => p.permissionId === 3
    ); // 3 = edit permission ID

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
