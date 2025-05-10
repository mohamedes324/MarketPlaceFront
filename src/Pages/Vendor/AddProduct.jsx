import React, { useState } from "react";
import Sidebar from "../../Components/sidebar";
import Navbar from "../../Components/navbar";
import styles from "./AddProduct.module.css";
import { useEffect } from "react";
import Popup from "../../Components/Popup";
import * as Functions from "../../Components/Functions";

const AddProduct = () => {
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const [categories, setCategories] = useState([]);
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    quantity: "",
    categoryId: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5161/api/Categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setProductData({
        ...productData,
        image: e.target.files[0], // الصورة
      });
    } else {
      setProductData({
        ...productData,
        [e.target.name]: e.target.value, // أي حاجة تانية زي text أو number
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", productData.title);
    formData.append("description", productData.description);
    formData.append("price", productData.price);
    formData.append("image", productData.image);
    formData.append("quantity", productData.quantity);
    formData.append("categoryId", productData.categoryId);

    try {
      const response = await fetch("http://localhost:5161/api/Products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        Functions.showPopupWithReload(
          "✅Product added successfully!",
          setPopup
        ); 
      } else {
        Functions.showPopupWithoutReload(
          "You Don't Have The Approval To Add Product",
          setPopup
        ); 
      }
    } catch (error) {
      Functions.showPopupWithReload(
        error,
        setPopup
      ); 
    }
  };

  return (
    <div>
      <Popup show={popup.show} message={popup.message} type={popup.type} />
      <div className={`${popup.show ? "blurred-container" : ""}`}>
        <Navbar />

        <div className={styles["sidebar-and-main"]}>
          <Sidebar />

          <div className={styles.main}>
            <div className={styles["main-add-product"]}>
              <h1>Add Product</h1>
              <form
                className={styles["form-add-product"]}
                onSubmit={handleSubmit}
              >
                <input
                  type="text"
                  name="title"
                  value={productData.title}
                  onChange={handleChange}
                  placeholder="Product Title"
                  required
                  maxLength={70}
                />
                <textarea
                  name="description"
                  value={productData.description}
                  onChange={handleChange}
                  placeholder="Product Description"
                  required
                  maxLength={150}
                />
                <input
                  type="number"
                  name="price"
                  value={productData.price}
                  onChange={handleChange}
                  placeholder="Price"
                  required
                />

                <label style={{ color: "#FFD700" }}>Category:</label>
                <select
                  required
                  name="categoryId"
                  value={productData.categoryId}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      categoryId: e.target.value,
                    })
                  }
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

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />

                <input
                  type="number"
                  name="quantity"
                  value={productData.quantity}
                  onChange={handleChange}
                  placeholder="Quantity"
                  required
                />

                <button type="submit">Add Product</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
