import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import Popup from "../Components/Popup";

function Register() {
  const navigate = useNavigate();
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  // متابعة بيانات الفورم
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "Customer",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role: role,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5161/api/Auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });


      const data = await response.json();

      if (response.ok) {
        setPopup({
          show: true,
          message: "✅Registration successful! Redirecting...",
        });
        setTimeout(() => {
          navigate("/Login");
        }, 3000);
      } else {
        setPopup({
          show: true,
          message: data.message || "❌ Registration failed",
        });
        setTimeout(() => setPopup({ show: false, message: "" }), 3000);
      }
    } catch (error) {
      console.error("❌ Error during fetch:", error);
      setPopup({ show: true, error: "An error occurred" });
      setTimeout(() => setPopup({ show: false, message: "" }), 3000);
    }
  };

  return (
    <>
      <Popup show={popup.show} message={popup.message} />

      <div className={`register-page ${popup.show ? "blurred-container" : ""}`}>
        <div className="register-box">
          <h2>Register Page</h2>

          <div className="role-select">
            <button
              type="button"
              className={`role-button ${
                formData.role === "Customer" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("Customer")}
            >
              Customer
            </button>
            <button
              type="button"
              className={`role-button ${
                formData.role === "Vendor" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("Vendor")}
            >
              Vendor
            </button>
          </div>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="register-input"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="register-input"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              className="register-input"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="register-input"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="register-button">
              Register
            </button>
          </form>

          <p className="have-account">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
