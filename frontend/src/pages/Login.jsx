import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [generatedCaptcha, setGeneratedCaptcha] = useState("");
  const navigate = useNavigate();

  const generateCaptcha = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setGeneratedCaptcha(result);
  };

  useEffect(() => {
    generateCaptcha(); // 頁面加載時生成驗證碼
  }, []);

  const handleLogin = () => {
    if (username === "JUAHUA" && password === "69553174" && captcha === generatedCaptcha) {
      navigate("/home");
    } else {
      alert("帳號、密碼或驗證碼錯誤");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div
        className="relative bg-cover bg-center rounded-lg"
        style={{
          backgroundImage: `url('/Images/login-bg.png')`,
          width: "90vh",
          height: "70vh",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-8 rounded-lg w-[300px] mt-24">
            <div className="space-y-3">
              <div className="flex items-center border rounded p-2">
                <img src="/Images/login-icon02.png" alt="User Icon" className="w-5 h-5 mr-2" />
                <input
                  type="text"
                  placeholder="請輸入帳號"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center border rounded p-2">
                <img src="/Images/login-icon03.png" alt="Lock Icon" className="w-5 h-5 mr-2" />
                <input
                  type="password"
                  placeholder="請輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center border rounded p-2">
                <img src="/Images/login-icon04.png" alt="Captcha Icon" className="w-5 h-5 mr-2" />
                <input
                  type="text"
                  placeholder="驗證碼"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  className="w-full p-2 focus:outline-none focus:border-blue-500"
                />
                <div className="p-2 border rounded bg-gray-200 ml-2">{generatedCaptcha}</div>
              </div>
              <div className="flex">
                <button
                  onClick={handleLogin}
                  className="w-full p-2 mx-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  登入
                </button>
                <button
                  onClick={() => {
                    setUsername("");
                    setPassword("");
                    setCaptcha("");
                  }}
                  className="w-full p-2 mx-1 bg-gray-300 text-black rounded hover:bg-gray-400"
                >
                  清除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
