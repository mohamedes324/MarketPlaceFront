import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar.jsx";
import styles from "./allcategories.module.css";
import Sidebar from "../Components/sidebar";
import { useNavigate } from "react-router-dom";
import Category from "../Components/Category";
import * as Functions from "../Components/Functions";
import Alert from "../Components/alert";
import Popup from "../Components/Popup";
import * as FaIcons from "react-icons/fa";
import EditCategory from "../Components/EditCategory";
import * as APIs from "../../services/productService.js";

const AllCategories = () => {
  const role = Functions.getUserRole();
  const [Categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    categoryId: 0,
  });
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({
    id: 0,
    title: "",
    img: null,
  });
  
    //  APIs.get and best practice
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await APIs.get(APIs.endpoints.getCategories)
        console.log(res)
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function handleViewProducts(id) {
    navigate("/productsOfCategory", { state: id });
  }

  function handleDeleteButton(id) {
    setShowAlert({ status: true, type: "delete", categoryId: id });
  }

  async function handleDeletion(id) {
    try {
      const response = await fetch(
        `http://localhost:5161/api/Categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${Functions.getToken()}`,
          },
        }
      );

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

  function handleEditButton(category) {
    setFormData({
      id: category.id,
      title: category.title,
      img: category.imgUrl,
    });

    setShowAlert({ status: true, type: "edit" });
  }

  const categoriesArray = Categories.map((category) => {
    return (
      <Category category={category} key={category.id}>
        <div className="product-buttons">
          <button
            title="View Detiles"
            onClick={() => {
              handleViewProducts(category.id);
            }}
          >
            <FaIcons.FaEye />
          </button>
          {role === "Admin" && (
            <>
              <button
                title="Edit"
                onClick={() => {
                  handleEditButton(category);
                }}
              >
                <FaIcons.FaEdit />
              </button>

              <button
                title="Delete"
                onClick={() => {
                  handleDeleteButton(category.id);
                }}
              >
                <FaIcons.FaTrash />{" "}
              </button>
            </>
          )}
        </div>
      </Category>
    );
  });

  return (
    <>
      <Popup show={popup.show} message={popup.message} />

      {showAlert.status && showAlert.type === "delete" && (
        <Alert onClose={() => setShowAlert(false)}>
          <div className={`${popup.show ? "blurred-container" : ""}`}>
            <h1>Are you sure?</h1>
            <div className={styles.buttons}>
              <button
                className={styles["button"]}
                onClick={() => {
                  handleDeletion(showAlert.categoryId);
                }}
              >
                Yes
              </button>
              <button
                className={styles["button"]}
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
            <EditCategory
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

          <div className={styles.main}>{categoriesArray}</div>
        </div>
      </div>
    </>
  );
};

export default AllCategories;
