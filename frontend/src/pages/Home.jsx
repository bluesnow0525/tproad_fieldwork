import React from "react";

function Home() {
  const cards = [
    {
      title: "案件管理",
      description: "管理和追蹤所有維修案件的狀態",
      icon: "📋",
      link: "/case/management",
    },
    {
      title: "公司車隊管理",
      description: "管理車輛和人員調度",
      icon: "🚗",
      link: "/system-management/fleet",
    },
    {
      title: "圖台",
      description: "互動式地圖查看案件分布",
      icon: "🗺️",
      link: "/map/real-time-vehicle",
    },
    {
      title: "報表統計",
      description: "查看各類數據統計和分析報表",
      icon: "📊",
      link: "/statistics/monthly",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 增強版頂部歡迎區塊 */}
      <div className="relative bg-[#F8FBFE] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E3F2FD] to-[#90CAF9] opacity-30"></div>
          <div className="absolute inset-0 bg-[url('/Images/grid.png')] opacity-5"></div>
        </div>

        <div className="relative container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                系統運行中
              </div>

              <h1 className="text-3xl font-bold text-[#1565C0] mb-2">
                道路巡查管理系統
              </h1>

              <p className="text-gray-600 max-w-xl">
                高效率的道路維護管理平台，即時追蹤、快速處理
              </p>
            </div>

            {/* <div className="flex space-x-3">
              <div className="text-center px-6 py-3 bg-white shadow-lg rounded-lg">
                <div className="text-2xl font-bold text-[#2196F3]">1,234</div>
                <div className="text-gray-500 text-sm">本月案件</div>
              </div>
              <div className="text-center px-6 py-3 bg-white shadow-lg rounded-lg">
                <div className="text-2xl font-bold text-[#2196F3]">5.0</div>
                <div className="text-gray-500 text-sm">滿意度</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* 功能卡片區塊 */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">主要功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {card.title}
                </h3>
                <p className="text-gray-600 mb-4">{card.description}</p>
                <button
                  onClick={() => (window.location.href = card.link)}
                  className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center group"
                >
                  <span>進入管理</span>
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部資訊區塊 */}
      <div className="bg-gray-200">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">聯絡資訊</h3>
              <p className="text-gray-500 leading-relaxed">
                地址：xxx
                <br />
                電話：xxx-xxxx
                <br />
                信箱：xxx@tproad.com
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">系統資訊</h3>
              <p className="text-gray-500 leading-relaxed">
                版本：1.0.0
                <br />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
