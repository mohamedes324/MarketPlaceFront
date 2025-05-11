import React, { useEffect, useState } from "react";
import styles from "./CompletedOrders.module.css";
import Navbar from "../../Components/Navbar";
import Sidebar from "../../Components/sidebar";
import * as Functions from "../../Components/Functions";
import * as APIs from "../../../services/productService.js";

const CompletedOrders = () => {
  const [orders, setorders] = useState([]);

  // this uses APIs.get but spical case 
  useEffect(() => {
    const fetchorders = async () => {
      try {
        const userId = Functions.getUserId();
        
        const response = await APIs.get(`/Orders/completed?customerId=${userId}`);

        const data = response.data;
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

        <div className={styles.main}>
          {orderArray.length === 0 ? (
              <h1 style={{color:"#FFD700"}}>There aren't any completed orders</h1>
            ) : (
              orderArray
            )}</div>
      </div>
    </div>
  );
};

export default CompletedOrders;
