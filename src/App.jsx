import { Routes, Route } from "react-router-dom";
import MainHome from "./Pages/Guest/MainHome";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AddProduct from "./Pages/Vendor/AddProduct";
import VendorHome from "./Pages/Vendor/VendorHome";
import MyProducts from "./Pages/Vendor/MyProducts";
import AdminHome from "./Pages/Admin/AdminHome";
import AddCategories from "./Pages/Admin/AddCategories";
import WaitingProducts from "./Pages/Admin/WaitingProducts";
import CustomerHome from "./Pages/Customer/customerHome";
import SavedProducts from "./Pages/Customer/SavedProducts";
import ManagePermissions from "./Pages/Admin/ManagePermissions";
import Cart from "./Pages/Customer/Cart";
import ViewDetails from "./Pages/viewDetails";
import AllCategories from "./Pages/AllCategories";
import ProductsOfCategory from "./Pages/productsOfCategory";
import CompletedOrders from "./Pages/Customer/CompletedOrders";
import WaitingAccounts from "./Pages/Admin/WaitingAccounts";

function App() {
  return (
      <Routes>
        <Route path="/" element={<MainHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/AddProduct" element={<AddProduct />} />
        <Route path="/VendorHome" element={<VendorHome />} />
        <Route path="/adminHome" element={<AdminHome />} />
        <Route path="/AddCategories" element={<AddCategories />} />
        <Route path="/MyProducts" element={<MyProducts />} />
        <Route path="/WaitingProducts" element={<WaitingProducts />} />
        <Route path="/AllCategories" element={<AllCategories />} />
        <Route path="/productsOfCategory" element={<ProductsOfCategory />} />
        <Route path="/customerHome" element={<CustomerHome />} />
        <Route path="/savedProducts" element={<SavedProducts />} />
        <Route path="/ManagePermissions" element={<ManagePermissions />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/ViewDetails" element={<ViewDetails />} />
        <Route path="/CompletedOrders" element={<CompletedOrders />} />
        <Route path="/WaitingAccounts" element={<WaitingAccounts />} />
      </Routes>
  );
}

export default App;
