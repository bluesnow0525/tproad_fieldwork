import React, { useState } from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      [menu]: !prev[menu] ? true : false, // Only toggle the current menu
    }));
  };

  return (
    <div className="bg-gray-200 w-64 h-full fixed">
      <nav className="mt-6 ml-5"> 
        <ul className="text-lg">
          <li className="p-2 flex font-bold text-xl items-center">
            <img
              src="/Images/icon_01.png"
              alt="Home"
              className="w-5 h-5 mr-2"
            />
            <Link to="/home">首頁</Link>
          </li>

          <li className="p-2">
            <button
              onClick={() => toggleMenu("caseManagement")}
              className="w-full text-left font-bold text-xl flex items-center"
            >
              <img
                src="/Images/icon_1.png"
                alt="Case Management"
                className="w-5 h-5 mr-2"
              />
              案件管理
            </button>
            <ul
              className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${openMenus.caseManagement ? "max-h-40" : "max-h-0"}`}
            >
              <li className="p-2 flex items-center">
                <Link to="/case/management">案件管理</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/case/report">報表作業</Link>
              </li>
            </ul>
          </li>

          <li className="p-2">
            <button
              onClick={() => toggleMenu("application")}
              className="w-full font-bold text-xl text-left flex items-center"
            >
              <img
                src="/Images/icon_2.png"
                alt="Request"
                className="w-5 h-5 mr-2"
              />
              申請單
            </button>
            <ul
              className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${openMenus.application ? "max-h-40" : "max-h-0"}`}
            >
              <li className="p-2 flex items-center">
                <Link to="/application/case-management">案件管理</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/application/roster-management">清冊管理</Link>
              </li>
            </ul>
          </li>

          <li className="p-2">
            <button
              onClick={() => toggleMenu("construction")}
              className="w-full font-bold text-xl text-left flex items-center"
            >
              <img
                src="/Images/icon_3.png"
                alt="Construction"
                className="w-5 h-5 mr-2"
              />
              施工
            </button>
            <ul
              className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${openMenus.construction ? "max-h-40" : "max-h-0"}`}
            >
              <li className="p-2 flex items-center">
                <Link to="/construction/case-management">案件管理</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/construction/self-inspection">自主檢查表</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/construction/roster-production">清冊製作與管理</Link>
              </li>
            </ul>
          </li>

          <li className="p-2 flex items-center font-bold text-xl">
            <img
              src="/Images/icon_4.png"
              alt="Payment"
              className="w-5 h-5 mr-2"
            />
            <Link to="/payment">請款</Link>
          </li>

          <li className="p-2">
            <button
              onClick={() => toggleMenu("map")}
              className="w-full font-bold text-xl text-left flex items-center"
            >
              <img
                src="/Images/icon_5.png"
                alt="Map"
                className="w-5 h-5 mr-2"
              />
              圖台
            </button>
            <ul
              className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${openMenus.map ? "max-h-60" : "max-h-0"}`}
            >
              <li className="p-2 flex items-center">
                <Link to="/map/real-time-vehicle">即時車輛軌跡與影像</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/map/historical-track">歷史軌跡查詢與下載</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/map/case-display">案件查詢後呈現</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/map/fleet-coverage">車隊巡查覆蓋率</Link>
              </li>
            </ul>
          </li>

          <li className="p-2">
            <button
              onClick={() => toggleMenu("roadHistory")}
              className="w-full font-bold text-xl text-left flex items-center"
            >
              <img
                src="/Images/icon_6.png"
                alt="Road History"
                className="w-5 h-5 mr-2"
              />
              道路履歷
            </button>
            <ul
              className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${openMenus.roadHistory ? "max-h-40" : "max-h-0"}`}
            >
              <li className="p-2 flex items-center">
                <Link to="/road-history/aar">AAR道路區塊</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/road-history/pc">PC道路區塊</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/road-history/epc">EPC道路區塊</Link>
              </li>
            </ul>
          </li>

          <li className="p-2">
            <button
              onClick={() => toggleMenu("statistics")}
              className="w-full font-bold text-xl text-left flex items-center"
            >
              <img
                src="/Images/icon_7.png"
                alt="Statistics"
                className="w-5 h-5 mr-2"
              />
              查詢統計
            </button>
            <ul
              className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${openMenus.statistics ? "max-h-40" : "max-h-0"}`}
            >
              <li className="p-2 flex items-center">
                <Link to="/statistics/monthly">月度統計</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/statistics/yearly">年度統計</Link>
              </li>
            </ul>
          </li>

          <li className="p-2">
            <button
              onClick={() => toggleMenu("systemManagement")}
              className="w-full font-bold text-xl text-left flex items-center"
            >
              <img
                src="/Images/icon_8.png"
                alt="System Management"
                className="w-5 h-5 mr-2"
              />
              系統管理
            </button>
            <ul
              className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${openMenus.systemManagement ? "max-h-80" : "max-h-0"}`}
            >
              <li className="p-2 flex items-center">
                <Link to="/system-management/bidding">標案管理</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/system-management/fleet">公司車隊管理</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/system-management//work-account">工務帳號管理</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/system-management/shared-code">共用代碼管理</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/system-management/menu-permission">選單權限管理</Link>
              </li>
              <li className="p-2 flex items-center">
                <Link to="/system-management/change-log">系統異動紀錄</Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
