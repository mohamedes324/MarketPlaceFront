import React, { useEffect, useState } from "react";
import Navbar from "../Components/navbar";
import styles from "./allcategories.module.css";
import Sidebar from "../Components/sidebar";
import { useNavigate } from "react-router-dom";
import Category from "../Components/Category";
import * as Functions from "../Components/Functions";
import Alert from "../Components/alert";
import Popup from "../Components/Popup";
import * as FaIcons from "react-icons/fa";
import EditCategory from "../Components/EditCategory";

const AllCategories = () => {
  const role = Functions.getUserRole();
  const [allCategories, setAllCategories] = useState([]);
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
    img: null, // هنا هتبقى الصورة نفسها مش URL
  });
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token"); // أو حسب مكان حفظك للتوكن
        const response = await fetch(`http://localhost:5161/api/Categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch Categories");
        }

        const data = await response.json();

        const formatted = data.map((item) => ({
          id: item.id,
          name: item.name,
          imgUrl: `http://localhost:5161/${item.imgUrl}`, // إضافة الرابط الكامل
        }));

        setAllCategories(formatted);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
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

  const categoriesArray = allCategories.map((category) => {
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
