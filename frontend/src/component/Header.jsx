import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      setCurrentTime(timeString);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // 修改：確保 user 存在且有名稱才顯示
  const displayName = user?.name || user?.username || "使用者";

  return (
    <header
      className="w-full bg-white h-[10vh] p-5 shadow-lg flex items-center justify-between sticky top-0 z-50"
      style={{
        backgroundImage: `url('/Images/top-bg.png')`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <img src="/Images/logo.png" alt="Logo" className="h-28 w-auto" />
      <nav className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-blue-800">{displayName} 您好</h1>
        <span className="text-lg">登入時間 {currentTime}</span>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="px-3 py-1 border border-black flex items-center"
        >
          <img src="/Images/icon-out.png" alt="Out" className="h-5 w-5 mr-1" />
          登出
        </button>
      </nav>
    </header>
  );
}

export default Header;
