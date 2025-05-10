import React, { useEffect, useState } from "react";
import styles from "./CompletedOrders.module.css";
import Product from "../../Components/Product";
import Navbar from "../../Components/navbar";
import Sidebar from "../../Components/sidebar";
import * as FaIcons from "react-icons/fa";
import * as Functions from "../../Components/Functions";

const CompletedOrders = () => {
  const [orders, setorders] = useState([]);
  useEffect(() => {
    const fetchorders = async () => {
      try {
        const token = Functions.getToken();
        const userId = Functions.getUserId();
        console.log(token);
        console.log(userId);
        const response = await fetch(
          `http://localhost:5161/api/Orders/completed?customerId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        setorders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchorders();
  }, []);

  const orderArray = orders.map((order) => {
    return (
      <div key={order.id} className={styles["order-box"]}>
        <div className={styles["order-part"]}>
          <h2><span>Order Id:</span> {order.id}</h2>
          <h2><span>Total Amount:</span> {order.totalAmount}</h2>
        </div>
        <div className={styles["order-part"]}>
          <h2><span>Created at:</span> {Functions.timeAgo(order.createdAt)}</h2>
          <h2><span>Comfirmed at:</span> {Functions.timeAgo(order.confirmedAt)}</h2>
        </div>
      </div>
    );
  });

  return (
    <div className={""}>
      <Navbar />

      <div className={styles["sidebar-and-main"]}>
        <Sidebar />

        <div className={styles.main}>{orderArray}</div>
      </div>
    </div>
  );
};

export default CompletedOrders;
