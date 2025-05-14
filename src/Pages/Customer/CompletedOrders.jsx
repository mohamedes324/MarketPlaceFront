import React, { useEffect, useState } from "react";
import styles from "./CompletedOrders.module.css";
import Navbar from "../../Components/Navbar";
import Sidebar from "../../Components/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import * as Functions from "../../Components/Functions";
import * as APIs from "../../../services/productService.js";

const CompletedOrders = () => {
  const [customerOrders, setCustomerOrders] = useState([]);
  const location = useLocation();
  let { customerId } = location.state || {};
  const role = Functions.getUserRole();
  const navigate = useNavigate();
  const userId = Functions.getUserId();

  if (role === "Customer") {
    customerId = userId;
  }

  // this uses APIs.get but spical case
  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        const response = await APIs.get(
          `/api/Orders/completed?customerId=${customerId}`
        );
        console.log(response.data);
        setCustomerOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchCustomerOrders();
  }, []);

  let customerOrderArray = [];

  customerOrderArray = customerOrders.map((order) => {
    return (
      <div
        key={order.id}
        className={styles["order-box"]}
        onClick={() => {
          handleCompletedOrderProductCustomer(order.id);
        }}
      >
        <div className={styles["order-part"]}>
          <h2>
            <span>Order Id:</span> {order.id}
          </h2>
          <h2>
            <span>Total Amount:</span> {order.totalAmount}
          </h2>
        </div>
        <div className={styles["order-part"]}>
          <h2>
            <span>Created at:</span> {Functions.timeAgo(order.createdAt)}
          </h2>
          <h2>
            <span>Comfirmed at:</span> {Functions.timeAgo(order.confirmedAt)}
          </h2>
        </div>
      </div>
    );
  });

  function handleCompletedOrderProductCustomer(orderId) {
    navigate("/CompletedOrderProducts", { state: { orderId } });
  }
  return (
    <div className={""}>
      <Navbar />

      <div className={styles["sidebar-and-main"]}>
        <Sidebar />

        <div className={styles.main}>
          {/* {orderArray.length === 0 ? (
            <h1 style={{ color: "#FFD700" }}>
              There aren't any completed orders
            </h1>
          ) : (
            orderArray
          )} */}
          {
          customerOrderArray.length == 0 ? (
            <h1 style={{ color: "#FFD700" }}>
              There aren't any completed orders
            </h1>
            ) : customerOrderArray 
          }

        </div>
      </div>
    </div>
  );
};

export default CompletedOrders;
