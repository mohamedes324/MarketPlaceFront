import React, { useState } from "react";
import styles from "./ViewDetails.module.css";
import Navbar from "../Components/navbar";
import Sidebar from "../Components/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import * as Functions from "../Components/Functions";
import Popup from "../Components/Popup";

const ViewDetails = () => {
  const location = useLocation();
  const { product } = location.state || {};
  console.log(product);
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  const role = Functions.getUserRole();
  console.log(role);

  const arrayOfNumbers = [];

  for (let i = 1; i <= product.quantity; i++) {
    arrayOfNumbers.push(i);
  }

  const options = arrayOfNumbers.map((num) => {
    return <option key={num}>{num}</option>;
  });

  const handleChangeQuantity = (e) => {
    setSelectedQuantity(e.target.value);
  };

  const handleAddToCart = async (productId, quantity) => {
    try {
      console.log("Checking if user has cart...");

      const token = localStorage.getItem("token");

      const hasCartResponse = await fetch(
        "http://localhost:5161/api/Orders/has-cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let orderId;

      if (hasCartResponse.status === 404) {
        console.log("No cart found. Creating a new one...");

        const createCartResponse = await fetch(
          "http://localhost:5161/api/Orders/create",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!createCartResponse.ok) {
          throw new Error("Failed to create new cart.");
        }

        orderId = await createCartResponse.json();
        console.log(orderId);

        console.log("New cart created with orderId:", orderId);
      } else if (hasCartResponse.ok) {
        orderId = await hasCartResponse.json();
        console.log(orderId);
        console.log("Existing cart found with orderId:", orderId);
      } else {
        const errorText = await hasCartResponse.text();
        throw new Error("Unexpected response: " + errorText);
      }

      console.log("Adding product to cart...", {
        productId,
        quantity,
        orderId,
      });

      const addItemResponse = await fetch(
        "http://localhost:5161/api/OrderItems",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            productId,
            quantity,
          }),
        }
      );

      if (!addItemResponse.ok) {
        throw new Error("Failed to add product to cart");
      }
      Functions.showPopupWithReload(
        "✅ Product added to cart successfully!",
        setPopup
      );
    } catch (error) {
      console.error("❌ Error in handleAddToCart:", error);
    }
  };

  return (
    <>
      <Popup show={popup.show} message={popup.message} />

      <div className={`${popup.show ? "blurred-container" : ""}`}>
        <Navbar />

        <div className={styles["sidebar-and-main"]}>
          <Sidebar />

          <div className={styles.main}>
            <img
              className={styles["left-side"]}
              src={product.imageUrl}
              alt={product.title}
            />
            <div className={styles["right-side"]}>
              <h1 className={styles.title}>{product.title}</h1>
              <h3 className={styles.decription}>{product.description}</h3>
              <h4 className={styles.categoryName}>
                <span style={{ color: "white" }}>Category:</span>{" "}
                {product.categoryName}
              </h4>
              <h4 className={styles.vendor}>
                <span style={{ color: "white" }}>Vendor Name:</span>{" "}
                {product.vendorName}
              </h4>
              <h4 className={styles.price}>
                <span style={{ color: "white" }}>Price: </span>
                {product.price}
              </h4>
              <h4 className={styles.quantity}>
                <span style={{ color: "white" }}>Quantity: </span>
                {product.quantity}
              </h4>

              <h4 className={styles.views}>
                <span style={{ color: "white" }}>Views: </span>
                {product.viewsNumber}
              </h4>

              <h4 className={styles.views}>
                <span style={{ color: "white" }}>Created From: </span>
                {Functions.timeAgo(product.createdAt)}
              </h4>

              {role === "Vendor" && product.rejectionReason != null && (
                <h4 className={styles.views}>
                  <span style={{ color: "red" }}>rejection Reason: </span>
                  {product.rejectionReason}
                </h4>
              )}

              {role === "Customer" &&
                product.canBuy === true &&
                (product.isInCart === true ? (
                  <>
                    <button
                      style={{margin:"0 auto"}}
                      className={styles["card-button"]}
                      onClick={() => {
                        navigate("/cart");
                      }}
                    >
                      Go to card
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <p style={{ display: "inline", color: "white" }}>
                        Select quantity you want:{" "}
                      </p>
                      <select
                        className={styles.select}
                        onChange={handleChangeQuantity}
                        value={selectedQuantity}
                      >
                        {options}
                      </select>
                    </div>
                    <button
                      className={styles["card-button"]}
                      onClick={() => {
                        handleAddToCart(product.id, selectedQuantity);
                      }}
                    >
                      Add to card
                    </button>
                  </>
                ))}
              {role === "Customer" && product.canBuy === false && (
                <>
                  <h2
                    style={{ textAlign: "center", color: "red", margin: "0" }}
                  >
                    This product out of the stock
                  </h2>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewDetails;
