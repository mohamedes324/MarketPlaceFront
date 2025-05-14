import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar";
import Sidebar from "../../Components/sidebar";
import styles from "./cart.module.css";
import Product from "../../Components/Product";
import * as FaIcons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as Functions from "../../Components/Functions";
import Popup from "../../Components/Popup";
import Alert from "../../Components/alert";
import * as APIs from "../../../services/productService.js";
import ViewDetailsButton from "../../Components/productIcons/ViewDetilesButton.jsx";

const Cart = () => {
  const [form, setForm] = useState({
    address: "",
    notes: "",
  });
  const [productss, setProductss] = useState([]);
  const [cartInfo, setCartInfo] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    ProductId: 0,
  });
  const navigate = useNavigate();
  const token = Functions.getToken();

  // this use APIs.get and spical case 
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await APIs.get("/api/Orders/incart");
        const data = res.data;
        console.log(data);
  
        const cartInfo = {
          customerId: data.customerId,
          orderId: data.id,
          orderNotes: data.orderNotes,
          shippingAddress: data.shippingAddress,
          status: data.status,
          totalAmount: data.totalAmount,
        };
  
        setCartInfo(cartInfo);
  
        const formatted = data.orderItems.map((item) => ({
          productId: item.productId,
          id: item.id,
          title: item.productTitle,
          price: item.productPrice,
          imageUrl: `http://localhost:5161/${item.productImageUrl}`,
          orderItemQuantity: item.orderItemQuantity,
          productQuantity: item.productQuantity,
        }));
  
        setProductss(formatted);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
  
    fetchProducts();
  }, []);

  const productsArray = productss.map((product) => {
    return (
      <Product key={product.id} product={product}>
        <div className="product-buttons">
        <ViewDetailsButton
            handleViewButton={() => {
              Functions.handleViewButton(product, navigate, setPopup);
            }}
            product={product}
          />{" "}

        </div>
        <div className={styles.counterContainer}>
          {product.orderItemQuantity > 1 ? (
            <button
              className={styles.counterButton}
              onClick={() => {
                handleDecreasingCounter(product.id, product.orderItemQuantity);
              }}
            >
              -
            </button>
          ) : (
            <button 
            className={styles.deleteButton}
            onClick={() => {
              handleDeleteProduct(product.id)
            }}
            >
              <FaIcons.FaTrash />
            </button>
          )}
          <span className="quantity">{product.orderItemQuantity}</span>
          <button
            className={styles.counterButton}
            onClick={() => {
              handleIncreasingCounter(product.id, product.orderItemQuantity);
            }}
          >
            +
          </button>
        </div>
      </Product>
    );
  });


  // special case 
  const updateQuantity = async (id, newQuantity) => {
    console.log(`Sending PUT for item ${id} with quantity ${newQuantity}`); // 👈 عشان تتأكد إنك بعت القيمة صح

    const res = await fetch(
      `http://localhost:5161/api/OrderItems/${id}/quantity`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }), // 👈 غيرنا من orderItemQuantity إلى quantity
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed PUT: ${res.status} ${errorText}`);
      return false;
    }

    return true;
  };

  const updateLocalQuantity = (id, newQuantity) => {
    setProductss((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id
          ? { ...product, orderItemQuantity: newQuantity }
          : product
      )
    );
  };

  const handleIncreasingCounter = async (id) => {
    const product = productss.find((p) => p.id === id);
    if (!product) return;

    if (product.orderItemQuantity >= product.productQuantity) {
      Functions.showPopupWithoutReload(
        "You can't add more. Maximum quantity reached.",
        setPopup
      );
      return;
    }

    const newQuantity = product.orderItemQuantity + 1;

    const success = await updateQuantity(id, newQuantity);
    if (success) {
      updateLocalQuantity(id, newQuantity);
      updateTotalAmount(product.price, true); // ✅ زودنا
    }
  };

  const handleDecreasingCounter = async (id) => {
    const product = productss.find((p) => p.id === id);
    if (!product || product.orderItemQuantity <= 1) return;

    const newQuantity = product.orderItemQuantity - 1;

    const success = await updateQuantity(id, newQuantity);
    if (success) {
      updateLocalQuantity(id, newQuantity);
      updateTotalAmount(product.price, false); // ✅ زودنا
    }
  };

  const updateTotalAmount = (price, isIncreasing) => {
    setCartInfo((prev) => ({
      ...prev,
      totalAmount: isIncreasing
        ? prev.totalAmount + price
        : prev.totalAmount - price,
    }));
  };

  function handleNoteAlert() {
    setShowAlert({ status: true, type: "buy" });
  }

  async function handleBuy() {
    const shippingAddress = form.address;
    const orderNotes = form.notes;
    const orderId = cartInfo.orderId;
    const token = Functions.getToken();

    if (!shippingAddress || !orderNotes) {
      Functions.showPopupWithoutReload(
        "Please fill all the required fields.",
        setPopup
      );
      return;
    }

    const body = JSON.stringify({
      shippingAddress: shippingAddress,
      orderNotes: orderNotes,
    });

    console.log("Sending body:", body);

    // special case 
    try {
      const response = await fetch(
        `http://localhost:5161/api/Orders/${orderId}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: body,
        }
      );

      const text = await response.text();
      console.log("Response.ok:", response.ok);
      console.log("Response text:", text);

      if (!response.ok) {
        Functions.showPopupWithoutReload(`Error: ${text}`, setPopup);
        return;
      }

      setPopup({
        show: true,
        message: "✅Buy successful!",
      });
      setTimeout(() => {
        navigate("/CompletedOrders"); // ينتقل بعد ثانيتين
      }, 3000);

    } catch (error) {
      Functions.showPopupWithoutReload(`Error: ${error.message}`, setPopup);
    }
  }

  async function handleDeleteProduct(orderItemId) {
    try {
      const response = await fetch(
        `http://localhost:5161/api/OrderItems/${orderItemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete product");
      }
  
      Functions.showPopupWithReload(
        "✅ Product deleted successfully. Reloading...",
        setPopup
      );
    } catch (error) {
      Functions.showPopupWithoutReload(
        `❌ Failed to delete product: ${error.message}`,
        setPopup
      );
    }
  }

  return (
    <>
      <Popup show={popup.show} message={popup.message} />

      {/* orderNotes: data.orderNotes,
      shippingAddress: data.shippingAddress, */}

      {showAlert.status && showAlert.type === "buy" && (
        <Alert onClose={() => setShowAlert(false)}>
          <div
            className={`${styles["alert-div"]} ${
              popup.show ? styles["blurred-container"] : ""
            }`}
          >
            <div className={styles["alert-inputs"]}>
              <label htmlFor="">Write Your Address:</label>
              <input
                value={form.address}
                type="text"
                onChange={(e) => {
                  setForm({ ...form, address: e.target.value });
                }}
              />
            </div>
            <div className={styles["alert-inputs"]}>
              <label htmlFor="">Write Your Notes:</label>
              <input
                value={form.notes}
                type="text"
                onChange={(e) => {
                  setForm({ ...form, notes: e.target.value });
                }}
              />
            </div>
            <button className={styles["alert-button"]} onClick={handleBuy}>
              Submit
            </button>
          </div>
        </Alert>
      )}

      <div className={`${popup.show ? "blurred-container" : ""}`}>
        <Navbar />
        <div className={styles["sidebar-and-main"]}>
          <Sidebar />
          <div className={styles.main}>
            {cartInfo && productss.length != 0 &&(
              <div className={styles.totalAmountContainer}>
                <h2 style={{ color: "#FFD700" }}>
                  <span style={{ color: "white" }}>Total Amount:</span> $
                  {cartInfo.totalAmount.toFixed(2)}
                </h2>
                <button className={styles.BuyCart} onClick={handleNoteAlert}>
                  Buy
                </button>
              </div>
            )}

            <div className={styles.productsArray}>
              {productsArray.length === 0 ? (
                <h1 style={{color:"#FFD700"}}>There Isn't Any Cart</h1>
              ) : (
                productsArray
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
