import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/sidebar";
import Navbar from "../../Components/Navbar";
import styles from "./ManagePermissions.module.css";
import * as Functions from "../../Components/Functions";
import Popup from "../../Components/Popup";
import * as APIs from "../../../services/productService.js";


// دي تمام 

const ManagePermissions = () => {
  const [formData, setFormData] = useState({
    vendorId: "",
    permissions: [],
  });
  const [vendors, setVendors] = useState([]);
  const [actionType, setActionType] = useState("add");
  const [vendorPermissions, setVendorPermissions] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  // this new APIs.get and best practice 
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await APIs.get(APIs.endpoints.getAllVendors);
        setVendors(res.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  // this use APIs.get not endpoint spical case
  useEffect(() => {
    if (!formData.vendorId) return;
  
    const fetchVendorPermissions = async () => {
      try {
        const res = await APIs.get(`/api/VendorPermissions/${formData.vendorId}`);
  
        if (res.status === 404) {
          setVendorPermissions([]);
        } else if (res.ok) {
          setVendorPermissions(res.data);
        }
      } catch (err) {
        console.error("Error fetching vendor permissions:", err);
      }
    };
  
    fetchVendorPermissions();
  }, [formData.vendorId]);

  // this use APIs.get and best practice 
  useEffect(() => {
    const fetchAllPermissions = async () => {
      try {

        const res = await APIs.get(APIs.endpoints.getAllPermissions)
        
        if (!res.ok) {
          throw new Error("Failed to fetch permissions");
        }

        const data = res.data
        setAllPermissions(data);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchAllPermissions();
  }, []);

  const handleVendorChange = (e) => {
    setFormData({ ...formData, vendorId: e.target.value });
  };

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, value],
      });
    } else {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((perm) => perm !== value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vendorId) {
      Functions.showPopupWithoutReload(
        "Please select a vendor first.",
        setPopup
      );
      return;
    }

    if (formData.permissions.length === 0) {
      Functions.showPopupWithoutReload(
        "Please select the permissions you want.",
        setPopup
      );
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const permissionsToProcess = [...formData.permissions];

      const requests = permissionsToProcess.map(async (permissionName) => {
        const permission = allPermissions.find(
          (p) => p.name === permissionName
        );

        if (!permission) {
          console.error(`Permission not found: ${permissionName}`);
          return Promise.resolve();
        }

        if (actionType === "add") {
          const payload = {
            vendorId: formData.vendorId,
            permissionId: permission.id,
          };

          const response = await fetch(
            "http://localhost:5161/api/VendorPermissions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to add permission ${permissionName}`);
          }
        } else if (actionType === "delete") {
          const vp = vendorPermissions.find(
            (vp) => vp.permissionId === permission.id
          );

          if (!vp) {
            console.error(
              `Permission ${permissionName} not assigned to vendor`
            );
            return Promise.resolve();
          }

          const response = await fetch(
            `http://localhost:5161/api/VendorPermissions/${vp.vendorPermissionId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Failed to delete permission ${permissionName} (ID: ${vp.vendorPermissionId})`
            );
          }
        }
      });

      await Promise.all(requests);

      Functions.showPopupWithoutReload(
        "Permissions updated successfully!",
        setPopup
      );

      const updated = await fetch(
        `http://localhost:5161/api/VendorPermissions/${formData.vendorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newPermissions = updated.ok ? await updated.json() : [];
      setVendorPermissions(newPermissions);
      setFormData({ ...formData, permissions: [] });
    } catch (error) {
      console.error("Error updating permissions:", error);
      Functions.showPopupWithoutReload(
        "There was an error updating the permissions.",
        setPopup
      );
    }
  };

  const getFilteredPermissions = () => {
    if (actionType === "add") {
      return allPermissions.filter(
        (perm) =>
          !vendorPermissions ||
          !vendorPermissions.some((vPerm) => vPerm.permissionId === perm.id)
      );
    } else if (actionType === "delete") {
      return allPermissions.filter(
        (perm) =>
          vendorPermissions &&
          vendorPermissions.some((vPerm) => vPerm.permissionId === perm.id)
      );
    }
    return [];
  };

  return (
    <>
      <Popup show={popup.show} message={popup.message} />
      <div className={`${popup.show ? "blurred-container" : ""}`}>
        <Navbar />
        <div className={styles["sidebar-and-main"]}>
          <Sidebar />
          <div className={styles.main}>
            <div className={styles["main-permission"]}>
              <h1 className={styles.title}>Manage Permissions</h1>

              <div>
                <label style={{ color: "white", marginRight: "10px" }}>
                  Choose Vendor:
                </label>
                <select value={formData.vendorId} onChange={handleVendorChange}>
                  <option value="" disabled>
                    Vendor names
                  </option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.userName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.permissionButtons}>
                <button
                  type="button"
                  className={`${styles.permissionButton} ${
                    actionType === "add" ? styles.active : ""
                  }`}
                  onClick={() => setActionType("add")}
                >
                  Add Permission
                </button>
                <button
                  type="button"
                  className={`${styles.permissionButton} ${
                    actionType === "delete" ? styles.active : ""
                  }`}
                  onClick={() => setActionType("delete")}
                >
                  Delete Permission
                </button>
              </div>

              <div className={styles["bottm-part"]}>
                <label className={styles["bottm-part-title"]}>
                  Permissions:
                </label>

                {getFilteredPermissions().map((perm) => (
                  <div key={perm.id} className={styles["checkbox-and-name"]}>
                    <input
                      id={perm.id}
                      className={styles.checkbox}
                      type="checkbox"
                      value={perm.name}
                      checked={formData.permissions.includes(perm.name)}
                      onChange={handlePermissionChange}
                    />
                    <label
                      htmlFor={perm.id}
                      className={styles["checkbox-name"]}
                    >
                      {perm.name}
                    </label>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                className={styles["submit-button"]}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagePermissions;
