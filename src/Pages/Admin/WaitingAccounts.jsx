import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar";
import Product from "../../Components/Product";
import styles from "./WaitingAccounts.module.css";
import Sidebar from "../../Components/sidebar";
import Alert from "../../Components/alert";
import * as Functions from "../../Components/Functions";
import * as FaIcons from "react-icons/fa";
import Popup from "../../Components/Popup";
import * as APIs from "../../../services/productService.js";

const WaitingAccounts = () => {
  // Stats
  const [vendors, setVendors] = useState([]);
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "",
    vendorId: 0,
  });

  const [rejectReason, setRejectReason] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  // this use APIs.get not endpoint spical case
  useEffect(() => {
    const fetchWaitingAccounts = async () => {
      try {
        const res = await APIs.get("/api/Vendors/waiting");
  
        if (!res.ok) {
          throw new Error("Failed to fetch vendors");
        }
  
        setVendors(res.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
  
    fetchWaitingAccounts();
  }, []);


  async function handleAcception(vendorId) {
    const token = Functions.getToken();

    const url = `http://localhost:5161/api/Vendors/${vendorId}/status`;
    const body = {
      rejectionReason: "Accept",
      status: 1,
    };

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      Functions.showPopupWithReload(`Accepted successfully✅`, setPopup);
    } catch (error) {
      console.error("Request failed:", error);
    }
  }

  async function handleRejection(vendorId) {
    const token = Functions.getToken();

    const url = `http://localhost:5161/api/Vendors/${vendorId}/status`;
    const body = {
      rejectionReason: rejectReason,
      status: 2,
    };

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      Functions.showPopupWithReload("Rejected successfully ✅", setPopup);
    } catch (error) {
      Functions.showPopupWithReload(`Request failed: ${error}`, setPopup);
    }
  }

  const vendorsArray = vendors.map((vendor) => {
    return (
        <div key={vendor.id} className={styles["vendor-box"]}>
          <div className={styles["vendor-part-text"]}>
            <h2>
              <span>Vendor Name:</span> {vendor.userName}
            </h2>
            <h2>
              <span>Vendor Email:</span> {vendor.email}
            </h2>
          </div>
          <div className={styles["vendor-part-buttons"]}>
            {" "}
            <button
              className={styles["reject-accept"]}
              onClick={() => {
                handleAcceptButton(vendor.id);
              }}
            >
              ِAccept
            </button>
            <button
              className={styles["reject-accept"]}
              onClick={() => {
                handleRejectButton(vendor.id);
              }}
            >
              Reject
            </button>
          </div>
        </div>
    );
  });

  function handleRejectButton(id) {
    setShowAlert({ status: true, type: "reject", vendorId: id });
  }

  function handleAcceptButton(id) {
    setShowAlert({ status: true, type: "accept", vendorId: id });
  }

  return (
    <>
      <Popup show={popup.show} message={popup.message} />

      {showAlert.status && showAlert.type === "reject" && (
        <Alert onClose={() => setShowAlert(false)}>
          <div className={`view-main ${popup.show ? "blurred-container" : ""}`}>
            <h2>Write Your Reject Reason</h2>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <button
              style={{
                display: "block",
                margin: "10px auto",
                padding: "5px",
                width: "20%",
                borderRadius: "10px",
              }}
              onClick={() => handleRejection(showAlert.vendorId)}
            >
              Yes
            </button>
          </div>
        </Alert>
      )}

      {showAlert.status && showAlert.type === "accept" && (
        <Alert onClose={() => setShowAlert(false)}>
          <div className={`${popup.show ? "blurred-container" : ""}`}>
            <h1>Are you sure?</h1>
            <div className={styles.buttons}>
              <button
                className={styles.button}
                onClick={() => {
                  console.log(showAlert.vendorId);
                  handleAcception(showAlert.vendorId);
                }}
              >
                Yes
              </button>
              <button
                className={styles.button}
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

      <div className={`${popup.show ? "blurred-container" : ""}`}>
        <Navbar />

        <div className={styles["sidebar-and-main"]}>
          <Sidebar />

          <div className={styles.main}>
            {vendorsArray.length === 0 ? (
              <h1 style={{ color: "#FFD700" }}>
                There are no waiting Accounts
              </h1>
            ) : (
              vendorsArray
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WaitingAccounts;
