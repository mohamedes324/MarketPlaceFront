import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import * as Functions from "./Functions";
import * as FaIcons from "react-icons/fa";
import { useState, useEffect } from "react";
import * as APIs from "../../services/productService";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const [notifications, setNotifications] = useState([]);
  const [active, setActive] = useState("not-active");
  const [searchQuery, setSearchQuery] = useState("");
  const role = Functions.getUserRole();
  const userId = Functions.getUserId();

  // ✅ 1. جلب الإشعارات القديمة
  const fetchNotifications = async () => {
    try {
      const res = await APIs.get(`/api/Notifications/Vendor/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // ✅ 2. WebSocket - إشعارات لحظية
  useEffect(() => {
    if (!userId || role !== "Vendor") return;

    // تحميل الإشعارات القديمة
    fetchNotifications();
    // فتح WebSocket
    const socket = new WebSocket(`ws://localhost:5161/ws?vendorId=${userId}`);
    window.socket = socket;

    console.log("Connecting to WebSocket...");

    socket.onopen = () => {
      console.log("WebSocket Connected ✅");
    };

    socket.onmessage = (event) => {
      try {
        if (event.data.startsWith("{") || event.data.startsWith("[")) {
          const newNotification = JSON.parse(event.data);
          console.log("New Notification Received 📩", newNotification);
          setNotifications((prev) => [newNotification, ...prev]);
        } else {
          // الرسالة مش JSON — نكونها يدويًا
          const newNotification = {
            id: Date.now(), // مؤقت
            message: event.data,
            createdAt: new Date().toISOString()
          };
          console.log("📩 Converted plain message to notification:", newNotification);
          setNotifications((prev) => [newNotification, ...prev]);
        }
      } catch (err) {
        console.error("❌ Failed to handle WebSocket message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket Error ❌", err);
    };

    socket.onclose = () => {
      console.log("WebSocket Closed 🔌");
    };

    // تنظيف الـ WebSocket لما الكومبوننت يتقفل
    return () => socket.close();
  }, [userId]);

  function handleOpenList() {
    setActive((prev) => (prev === "not-active" ? "active" : "not-active"));
  }

  function handleSearch(e) {
    if (e?.key && e.key !== "Enter") return;
    if (searchQuery.trim() !== "") {
      navigate(`/searchPage?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const notificationsArray = notifications.map((notice) => {
    return (
      <div key={notice.id || notice.message + Math.random()} className="notification-list">
        <h4>{notice.message}</h4>
        <h5>{Functions.timeAgo(notice.createdAt)}</h5>
      </div>
    );
  });

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
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
        <button className="search-icon-button" onClick={handleSearch}>
          <FaIcons.FaSearch className="search-icon" />
        </button>
      </div>

      <div className="navbar-right">
        {isLoggedIn && role === "Vendor" && (
          <>
            <div className={`notification-container ${active}`} onClick={handleOpenList}>
              <FaIcons.FaBell />
            </div>
            <div
              className={
                active === "active"
                  ? "notification-list-container"
                  : "notification-list-container notification-list-container-not-active"
              }
            >
              {notificationsArray}
            </div>
          </>
        )}

        {!isLoggedIn && (
          <span className="login-text" onClick={() => navigate("/Login")}>
            Login
          </span>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
