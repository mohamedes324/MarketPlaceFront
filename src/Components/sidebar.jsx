import { Link } from "react-router-dom";
import "./sidebar.css";
import * as UserUtils from "./Functions";
import * as FaIcons from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const role = UserUtils.getUserRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-links">
        {!role && (
          <>
            <Link to="/" className="icon-text">
              <FaIcons.FaHome className="icon" />
              <h3 className="text">Home</h3>
            </Link>
            <Link to="/AllCategories" className="icon-text">
              <FaIcons.FaFolderOpen className="icon" />
              <h3 className="text">All Categories</h3>
            </Link>
          </>
        )}

        {role === "Customer" && (
          <>
            <Link to="/CustomerHome" className="icon-text">
              <FaIcons.FaHome className="icon" />
              <h3 className="text">Home</h3>
            </Link>
            <Link to="/savedProducts" className="icon-text">
              <FaIcons.FaHeart className="icon" />
              <h3 className="text">Saved Products</h3>
            </Link>
            <Link to="/cart" className="icon-text">
              <FaIcons.FaShoppingCart className="icon" />
              <h3 className="text">Cart</h3>
            </Link>
            <Link to="/CompletedOrders" className="icon-text">
              <FaIcons.FaBoxOpen className="icon" />
              <h3 className="text">Completed Orders</h3>
            </Link>
            <Link to="/AllCategories" className="icon-text">
              <FaIcons.FaFolderOpen className="icon" />
              <h3 className="text">All Categories</h3>
            </Link>
            <div className="icon-text" onClick={handleLogout}>
              <FaIcons.FaSignOutAlt className="icon" />
              <h3 className="text">Logout</h3>
            </div>
          </>
        )}

        {role === "Vendor" && (
          <>
            <Link to="/VendorHome" className="icon-text">
              <FaIcons.FaHome className="icon" />
              <h3 className="text">Home</h3>
            </Link>
            <Link to="/AddProduct" className="icon-text">
              <FaIcons.FaPlusSquare className="icon" />
              <h3 className="text">Add Product</h3>
            </Link>
            <Link to="/MyProducts" className="icon-text">
              <FaIcons.FaThList className="icon" />
              <h3 className="text">My Products</h3>
            </Link>
            <Link to="/AllCategories" className="icon-text">
              <FaIcons.FaFolderOpen className="icon" />
              <h3 className="text">All Categories</h3>
            </Link>
            <div className="icon-text" onClick={handleLogout}>
              <FaIcons.FaSignOutAlt className="icon" />
              <h3 className="text">Logout</h3>
            </div>
          </>
        )}

        {role === "Admin" && (
          <>
            <Link to="/AdminHome" className="icon-text">
              <FaIcons.FaHome className="icon" />
              <h3 className="text">Home</h3>
            </Link>
            <Link to="/ManagePermissions" className="icon-text">
              <FaIcons.FaUserShield className="icon" />
              <h3 className="text">Manage Permissions</h3>
            </Link>
            <Link to="/AllCategories" className="icon-text">
              <FaIcons.FaFolderOpen className="icon" />
              <h3 className="text">All Categories</h3>
            </Link>
            <Link to="/AddCategories" className="icon-text">
              <FaIcons.FaFolderPlus className="icon" />
              <h3 className="text">Add Categories</h3>
            </Link>
            <Link to="/WaitingAccounts" className="icon-text">
              <FaIcons.FaHourglassHalf className="icon" />
              <h3 className="text">Waiting Accounts</h3>
            </Link>
            <Link to="/WaitingProducts" className="icon-text">
              <FaIcons.FaClock className="icon" />
              <h3 className="text">Waiting Products</h3>
            </Link>
            <div className="icon-text" onClick={handleLogout}>
              <FaIcons.FaSignOutAlt className="icon" />
              <h3 className="text">Logout</h3>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
