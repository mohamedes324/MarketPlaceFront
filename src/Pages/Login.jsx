import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import Popup from "../Components/Popup";
import * as Functions from "../Components/Functions";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5161/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        Functions.startAutoRefresh();

        const decodedToken = JSON.parse(atob(data.token.split(".")[1])); // فك التوكن للحصول على الـ role
        const role =
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        if (role === "Customer") {
          navigate("/customerHome");
        } else if (role === "Vendor") {
          if (role === "Vendor") {
            // استخراج الـ vendorId من التوكن
            const vendorId =
              decodedToken[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ]; // ده الكليم المعتاد للـ userId/vendorId
            try {
              const vendorResponse = await fetch(
                `http://localhost:5161/api/Vendors/${vendorId}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${data.token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              const vendorData = await vendorResponse.json();
              if (vendorData.approvalStatus === 0) {
                localStorage.removeItem("token");

                const message =
                  "Your account is pending approval... Please wait for admin confirmation.";
                Functions.showPopupWithoutReload(message, setPopup);
                return;
              } else if (vendorData.approvalStatus === 1) {
                navigate("/vendorHome");
              } else if (vendorData.approvalStatus === 2) {
                const message = `❌Your account has been rejected:
                                  ${vendorData.rejectionReason}`;
                Functions.showPopupWithoutReload(message, setPopup);
                localStorage.removeItem("token");

                return;
              }
            } catch (err) {
              console.error("Error fetching vendor data:", err);
            }

            return;
          }
          // navigate("/vendorHome");
        } else {
          navigate("/adminHome");
        }
      } else {
        setPopup({ show: true, message: data.message, type: "error" });
        setTimeout(
          () => setPopup({ show: false, message: "", type: "" }),
          3000
        );
      }
    } catch (error) {
      setPopup({ show: true, message: error, type: "error" });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
    }
  };

  return (
    <>
      <Popup show={popup.show} message={popup.message} type={popup.type} />
      <div className={`login-page ${popup.show ? "blurred-container" : ""}`}>
        <div className="login-box">
          <h2>Login Page</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="login-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="login-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          <p className="no-account">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
