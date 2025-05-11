// import * as Functions from "/Components/Functions.js"


// export const startAutoRefresh = () => {
//     const refresh = async () => {
//         const refreshToken = localStorage.getItem("refreshToken");

//         if (!refreshToken) {
//             console.warn("No refresh token found.");
//             return;
//         }

//         try {
//             const response = await fetch("http://localhost:5161/api/Auth/refresh-token", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(refreshToken),
//             });

//             if (response.ok) {
//                 const data = await response.json();
            
//                 if (data.token && data.refreshToken) {
//                     localStorage.setItem("token", data.token);
//                     localStorage.setItem("refreshToken", data.refreshToken);
//                     console.log("🔁 Tokens refreshed and saved.");
//                 } else {
//                     console.warn("⚠️ Response missing token or refreshToken:", data);
//                 }
//             } else {
//                 console.error("❌ Refresh token request failed with status:", response.status);
//             }

//         } catch (error) {
//             console.error("🔴 Error refreshing token:", error);
//         }
//     };

//     // كل دقيقة (60,000 ملي ثانية)
//     setInterval(refresh, 60 * 1000);
// };

export const getToken = () => {

    return localStorage.getItem('token');

};

export const getUserRole = () => {
    const token = localStorage.getItem("token");
    let role = null;

    if (token) {
        try {
            const decodedToken = JSON.parse(atob(token.split(".")[1]));
            role =
                decodedToken[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                ];
        } catch (err) {
            console.error("Invalid token", err);
        }
    }

    return role;
};


export const getUserId = () => {
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

export const showPopupWithoutReload = (data, setPopup) => {
    const message = typeof data === "string"
        ? data
        : data.message || data.title || "Something went wrong";

    setPopup({ show: true, message });
    setTimeout(() => setPopup({ show: false, message: "" }), 3000);
};

export const showPopupWithReload = (data, setPopup) => {
    const message = typeof data === "string"
        ? data
        : data.message || data.title || "Something went wrong";

    setPopup({ show: true, message });
    setTimeout(() => {
        setPopup({ show: false, message: "" });
        window.location.reload();
    }, 3000);
};


export function timeAgo(dateString) {
    // تحويل السلسلة إلى كائن Date
    const dateUTC = new Date(dateString);

    // الحصول على فرق التوقيت بين UTC والتوقيت المحلي (بالمللي ثانية)
    const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

    // تحويل التاريخ إلى توقيت محلي
    const date = new Date(dateUTC.getTime() - timezoneOffset);

    const now = new Date();

    // حساب الفارق بين الوقتين بالثواني
    const diff = (now - date) / 1000;

    if (diff < 10) {
        return "just now";
    }

    const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(diff / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
        }
    }

    return "just now";
}

