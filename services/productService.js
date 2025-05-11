// import * as APIs from "../../../services/productService.js";
import * as Functions from "../src/Components/Functions";


const API_BASE = "http://localhost:5161";

const token = () => localStorage.getItem("token");

export const get = async (endpoint) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token()}`
      }
    });

    const d = await res.json();

    const data =
      Array.isArray(d) && d.length > 0 && "imageUrl" in d[0]
        ? d.map((item) => ({
          ...item,
          imageUrl: item.imageUrl
            ? `${API_BASE}/${item.imageUrl}`
            : "/public/Photos/photo2.png", // صورة افتراضية لو null أو undefined
        }))
        : d;

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      data,
    };
  } catch (error) {
    console.error("API Request failed: ", error);
    throw error;
  }
};


const vendorId = Functions.getUserId();

export const endpoints = {
  getCategories: "/api/Categories",
  getAcceptProducts: "/api/Products/accepted",
  getMyProducts: `/api/Products/all/vendor/${vendorId}`,
  getVendorPermissions: `/api/VendorPermissions/${vendorId}`,
  getAllVendors: `/api/Vendors/all`,
  getAllPermissions: "/api/Permissions",
  getSavedProducts: "/api/SavedProducts",

}