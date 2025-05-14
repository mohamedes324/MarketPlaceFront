// import * as APIs from "../../../services/productService.js";
// import * as Functions from "../src/Components/Functions";


const API_BASE = "http://localhost:5161";

const token = () => localStorage.getItem("token");

export const get = async (endpoint) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    });

    const contentType = res.headers.get("content-type");
    let d;

    if (contentType?.includes("application/json")) {
      d = await res.json();
    } else {
      d = await res.text(); // مثلاً: "No cart found"
    }

    const data =
      Array.isArray(d) && d.length > 0 && "imageUrl" in d[0]
        ? d.map((item) => ({
            ...item,
            imageUrl: item.imageUrl
              ? `${API_BASE}/${item.imageUrl}`
              : "/public/Photos/photo2.png",
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


export const post = async (endpoint, body = null, isFormData = false) => {
  try {
    const headers = {
      Authorization: `Bearer ${token()}`,
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers,
      body: isFormData ? body : JSON.stringify(body), 
    });

    const contentType = res.headers.get("content-type");
    let data = null;

    if (contentType?.includes("application/json")) {
      data = await res.json();  
    } else {
      data = await res.text();
    }

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      data,
      error: !res.ok ? data?.message || "Unexpected error" : null,
    };
  } catch (error) {
    console.error("POST request failed:", error);
    return {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      data: null,
      error: error.message || "Request failed",
    };
  }
};


export const put = async (endpoint, body, isFormData = false) => {
  try {
    const headers = {
      Authorization: `Bearer ${token()}`,
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });

    const data = await res.json();

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      data,
    };
  } catch (error) {
    console.error("PUT request failed:", error);
    throw error;
  }
};


  const getUserId = () => {
  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
      try {
          const decodedToken = JSON.parse(atob(token.split(".")[1]));
          userId =
              decodedToken[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ];
      } catch (err) {
          console.error("Invalid token", err);
      }
  }

  return userId;
};
const vendorId = getUserId()

export const endpoints = {
  getCategories: "/api/Categories",
  getAcceptProducts: "/api/Products/accepted",
  getMyProducts: `/api/Products/all/vendor/${vendorId}`, // vendor only use it 
  getVendorPermissions: (vendorId) => `/api/VendorPermissions/${vendorId}`, // vendor and admin use it so I can't use vendorId like getMyProducts
  getAllVendors: `/api/Vendors/all`,
  getAllPermissions: "/api/Permissions",
  getSavedProducts: "/api/SavedProducts",
  getHasCard: "/api/Orders/has-cart",
  getProductHistory: (productId) => `/api/Products/${productId}/history`,
  postCategories: "/api/Categories",
  postViewProduct: (productId) => `/api/Products/views/${productId}`,
  postVendorPermissions: "/api/VendorPermissions",
  postSavedProducts: "/api/SavedProducts/",
  postProducts: "/api/Products",
  postOrderItem: "/api/OrderItems"

}