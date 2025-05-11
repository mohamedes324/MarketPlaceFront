import React, { useState } from "react";
import styles from "../Vendor/AddProduct.module.css";
import Navbar from "../../Components/Navbar";
import Sidebar from "../../Components/sidebar";
import * as Functions from "../../Components/Functions";
import Popup from "../../Components/Popup";

const AddCategories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryImage) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("Name", categoryName);
    formData.append("Image", categoryImage);

    try {
      const response = await fetch("http://localhost:5161/api/Categories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const text = await response.text();

      if (response.ok) {
        Functions.showPopupWithReload(
          "Category added successfully!✅",
          setPopup
        );
      } else {
        console.error("Error Response:", text);
        alert("Failed to add category.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the category.");
    }
  };
  
  return (
    <>
        <Popup show={popup.show} message={popup.message} />
    <div className={`${popup.show ? "blurred-container" : ""}`}>
      <Navbar />
      <div className={styles[`sidebar-and-main`]}>
        <Sidebar />

        <div className={styles.main}>
          <div className={styles["main-add-product"]}>
            <form
              className={styles["form-add-product"]}
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              <h1>Add Category</h1>

              <input
                type="text"
                name="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category Name"
                required
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCategoryImage(e.target.files[0])}
                required
              />

              <button type="submit">Add Category</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AddCategories;
