import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const [currentTime, setCurrentTime] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/"); // 導向到 `/` 路徑
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      setCurrentTime(timeString);
    };

    // 初次設定時間
    updateTime();

    // 每秒更新時間
    const intervalId = setInterval(updateTime, 1000);

    // 清除計時器
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header
      className="w-full bg-cover bg-left-top h-[12vh] p-5 shadow-lg flex items-center justify-between sticky top-0"
      style={{ backgroundImage: `url('/Images/top-bg.png')` }}
    >
      <img src="/Images/logo.png" alt="Logo" className="h-28 w-auto" />
      <nav className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-blue-800">覺華您好</h1>
        <span className="text-lg">登入時間 {currentTime}</span>
        <button
          onClick={handleLogout}
          className="px-3 py-1 border border-black flex"
        >
          <img src="/Images/icon-out.png" alt="Out" className="h-5 w-5" />
          登出
        </button>
      </nav>
    </header>
  );
}

export default Header;
