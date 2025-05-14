import React, { useEffect, useState } from "react";
import styles from "./ViewDetails.module.css";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import * as Functions from "../Components/Functions";
import Popup from "../Components/Popup";
import * as APIs from "../../services/productService.js";
import Alert from "../Components/alert.jsx";

const ViewDetails = () => {
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    productId: 0,
  });
  const [products, setProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // لتخزين الصورة المختارة
  const location = useLocation();
  const  {product}  = location.state || {};
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();
  const [currentProduct, setCurrentProduct] = useState({});
  const role = Functions.getUserRole();


  useEffect(() => {
    const fetchAcceptedProducts = async () => {
      try {
        const res = await APIs.get(APIs.endpoints.getAcceptProducts);
        console.log(res.data)
        console.log(product.id)
        const originalProduct =  res.data.find((p) => p.id === product.id )
        console.log(originalProduct)
        setCurrentProduct(originalProduct)
      } catch (err) {
        console.log(err);
      }
    };
    fetchAcceptedProducts();
  },[])

  const fetchAcceptedProducts = async () => {
    try {
      const res = await APIs.get(APIs.endpoints.getAcceptProducts);
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      const updatedProduct = products.find((p) => p.id === product.id);
      if (updatedProduct) {
        setCurrentProduct(prev => ({
          ...prev,
          imageUrl: updatedProduct.imageUrl,
        }));

      }
    }
  }, [products]);

  const arrayOfNumbers = [];

  for (let i = 1; i <= currentProduct.quantity; i++) {
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

      const hasCartResponse = await APIs.get(APIs.endpoints.getHasCard);

      let orderId;

      if (hasCartResponse.status === 404) {
        console.log("No cart found. Creating a new one...");

        const createCartResponse = await APIs.post("/api/Orders/create");

        if (!createCartResponse.ok) {
          throw new Error("Failed to create new cart.");
        }

        orderId = createCartResponse.data;
        console.log("New cart created with orderId:", orderId);
      } else if (hasCartResponse.ok) {
        orderId = hasCartResponse.data;
        console.log("Existing cart found with orderId:", orderId);
      } else {
        throw new Error("Unexpected error while checking cart.");
      }

      // إضافة المنتج للكارت
      console.log("Adding product to cart...", {
        productId,
        quantity,
        orderId,
      });

      const addItemResponse = await APIs.post(APIs.endpoints.postOrderItem, {
        orderId,
        productId,
        quantity,
      });

      if (!addItemResponse.ok) {
        throw new Error("Failed to add product to cart");
      }

      // تحديث حالة المنتج في الواجهة
      setCurrentProduct((prev) => ({
        ...prev,
        isInCart: true,
      }));

      // عرض رسالة نجاح
      Functions.showPopupWithoutReload(
        "✅ Product added to cart successfully!",
        setPopup
      );
    } catch (error) {
      console.error("❌ Error in handleAddToCart:", error);
      Functions.showPopupWithoutReload(
        `❌ Something went wrong: ${error.message}`,
        setPopup
      );
    }
  };

  function handleEditPhoto(productId) {
    setShowAlert({ status: true, type: "EditPhoto", productId: productId });
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file); // تخزين الصورة المختارة
    }
  };

  const handleChangeImage = async () => {
    if (!selectedImage) {
      console.log("No image selected.");
      alert("Please select an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("newImg", selectedImage); // إضافة الصورة إلى formData

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5161/api/Products/update-img/${product.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData, // إرسال formData مع الصورة
        }
      );

      if (response.ok) {
        fetchAcceptedProducts()
        
        setShowAlert({ status: false, type: "", productId: null });

      } else {
        const errorData = await response.json();
        console.log("Failed to update image:", errorData);
      }
    } catch (error) {
      console.error("Error updating image:", error);
    }
  };

  return (
    <>
      <Popup show={popup.show} message={popup.message} />

      {showAlert.status && showAlert.type === "EditPhoto" && role === "Vendor" &&(
        <Alert onClose={() => setShowAlert(false)}>
          <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleChangeImage}>Change</button>
          </div>
        </Alert>
      )}

      <div className={`${popup.show ? "blurred-container" : ""}`}>
        <Navbar />

        <div className={styles["sidebar-and-main"]}>
          <Sidebar />

          <div className={styles.main}>
            <img
              className={styles["img"]}
              src={currentProduct.imageUrl}
              alt={currentProduct.title}
              onClick={() => handleEditPhoto(currentProduct.productId)}
            />
            <div className={styles["right-side"]}>
              <h1 className={styles.title}>{currentProduct.title}</h1>
              <h3 className={styles.decription}>{currentProduct.description}</h3>
              <h4 className={styles.categoryName}>
                <span style={{ color: "white" }}>Category:</span>{" "}
                {currentProduct.categoryName}
              </h4>
              <h4 className={styles.vendor}>
                <span style={{ color: "white" }}>Vendor Name:</span>{" "}
                {currentProduct.vendorName}
              </h4>
              <h4 className={styles.price}>
                <span style={{ color: "white" }}>Price: </span>
                {currentProduct.price}
              </h4>
              <h4 className={styles.quantity}>
                <span style={{ color: "white" }}>Quantity: </span>
                {currentProduct.quantity}
              </h4>

              <h4 className={styles.views}>
                <span style={{ color: "white" }}>Views: </span>
                {currentProduct.viewsNumber}
              </h4>

              <h4 className={styles.views}>
                <span style={{ color: "white" }}>Created From: </span>
                {Functions.timeAgo(currentProduct.createdAt)}
              </h4>

              {role === "Vendor" &&
                currentProduct.rejectionReason != null &&
                currentProduct.rejectionReason != "Accept" && (
                  <h4 className={styles.views}>
                    <span style={{ color: "red" }}>rejection Reason: </span>
                    {currentProduct.rejectionReason}
                  </h4>
                )}

              {role === "Customer" &&
                currentProduct.canBuy === true &&
                (currentProduct.isInCart ? (
                  <>
                    <button
                      style={{ margin: "0 auto" }}
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
                        handleAddToCart(currentProduct.id, selectedQuantity);
                      }}
                    >
                      Add to card
                    </button>
                  </>
                ))}
              {role === "Customer" && currentProduct.canBuy === false && (
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
