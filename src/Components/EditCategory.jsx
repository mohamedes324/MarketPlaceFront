import React, { useEffect, useState } from "react";
import styles from "./EditVendor.module.css";
import * as Functions from "./Functions.js";
import Popup from "./Popup.jsx";

const EditCategory = ({ formData, handleChange, popup, setPopup }) => {
  const [categories, setCategories] = useState([]);

  async function handleEditSubmit(e) {
    e.preventDefault();
    const token = Functions.getToken();
    const apiUrl = `http://localhost:5161/api/Categories/${formData.id}`;

    const data = new FormData();
    data.append("Name", formData.title);
    data.append("Image", formData.img);

    try {
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // مفيش Content-Type هنا، المتصفح هيحطها تلقائيًا مع boundary
        },
        body: data,
      });

      if (!res.ok) {
        const error = await res.json();
        Functions.showPopupWithoutReload(
          error.message || "Edit failed ❌",
          setPopup
        );
        return;
      }

      Functions.showPopupWithReload(
        "Category updated successfully ✅",
        setPopup
      );
    } catch (error) {
      Functions.showPopupWithoutReload(error.message, setPopup);
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5161/api/Categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        setPopup({ show: true, message: error.message });
        setTimeout(() => setPopup({ show: false, message: "" }), 3000);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <Popup show={popup.show} message={popup.message} />
      <form
        className={`${styles["vendor-edit-form"]}  ${
          popup.show ? "blurred-container" : ""
        }`}
      >
        <div className={styles["alert-part"]}>
          <label htmlFor="title">title:</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles["alert-input"]}
          />
        </div>
        <div className={styles["alert-part"]}>
          <label htmlFor="description">description:</label>
          <input
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles["alert-input"]}
          />
        </div>
        <div className={styles["alert-part"]}>
          <label htmlFor="price">Price:</label>
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            className={styles["alert-input"]}
          />
        </div>
        <div className={styles["alert-part"]}>
          <label htmlFor="quantity">quantity:</label>
          <input
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            className={styles["alert-input"]}
          />
        </div>

        <select
          required
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          style={{ padding: "5px" }}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          style={{ borderRadius: "10px", padding: "2px", cursor: "pointer" }}
          onClick={handleEditSubmit}
        >
          Sumbit
        </button>
      </form>
    </>
  );
};

export default EditCategory
