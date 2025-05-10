// Navbar.js
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import * as Functions from "./Functions";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  const role = Functions.getUserRole();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link
          to={
            role === "Customer"
              ? "/CustomerHome"
              : role === "Vendor"
              ? "/VendorHome"
              : role === "Admin"
              ? "/adminHome"
              : "/"
          }
          className="logo"
        >
          Market
        </Link>
      </div>

      <div className="navbar-center">
        <input type="text" className="search-input" placeholder="Search..." />
      </div>

      <div className="navbar-right">
        <div  onClick={handleProfileClick}>
          {isLoggedIn ? (
            ""
          ) : (
            <span className="login-text">Login</span>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
