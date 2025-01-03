import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Sidebar() {
  const [openMenus, setOpenMenus] = useState({});
  const { user } = useAuth();

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      [menu]: !prev[menu] ? true : false,
    }));
  };

  const hasPermission = (category, subcategory) => {
    return user?.permissions?.[category]?.[subcategory] === true;
  };

  const hasAnySubPermissions = (category, subItems) => {
    return Object.entries(subItems).some(([key]) => hasPermission(category, key));
  };

  return (
    <div className="bg-gray-200 w-64 h-full fixed">
      <nav className="mt-6 ml-5">
        <ul className="text-lg">
          <li className="p-2 flex font-bold text-xl items-center">
            <img src="/Images/icon_01.png" alt="Home" className="w-5 h-5 mr-2" />
            <Link to="/home" className="hover:font-bold hover:underline">
              首頁
            </Link>
          </li>

          {hasAnySubPermissions("案件管理", { "案件管理": true, "報表作業": true }) && (
            <li className="p-2">
              <button
                onClick={() => toggleMenu("caseManagement")}
                className="w-full text-left font-bold text-xl flex items-center"
              >
                <img src="/Images/icon_1.png" alt="Case Management" className="w-5 h-5 mr-2" />
                案件管理
              </button>
              <ul className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${
                openMenus.caseManagement ? "max-h-40" : "max-h-0"
              }`}>
                {hasPermission("案件管理", "案件管理") && (
                  <li className="p-2 flex items-center">
                    <Link to="/case/management" className="hover:font-bold hover:underline">
                      案件管理
                    </Link>
                  </li>
                )}
                {hasPermission("案件管理", "報表作業") && (
                  <li className="p-2 flex items-center">
                    <Link to="/case/report" className="hover:font-bold hover:underline">
                      報表作業
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          )}

          {hasAnySubPermissions("申請單", { "案件管理": true, "清冊管理": true }) && (
            <li className="p-2">
              <button
                onClick={() => toggleMenu("application")}
                className="w-full font-bold text-xl text-left flex items-center"
              >
                <img src="/Images/icon_2.png" alt="Request" className="w-5 h-5 mr-2" />
                申請單
              </button>
              <ul className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${
                openMenus.application ? "max-h-40" : "max-h-0"
              }`}>
                {hasPermission("申請單", "案件管理") && (
                  <li className="p-2 flex items-center">
                    <Link to="/application/case-management" className="hover:font-bold hover:underline">
                      案件管理
                    </Link>
                  </li>
                )}
                {hasPermission("申請單", "清冊管理") && (
                  <li className="p-2 flex items-center">
                    <Link to="/application/roster-management" className="hover:font-bold hover:underline">
                      清冊管理
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          )}

          {hasAnySubPermissions("施工", { "案件管理": true, "自主檢查表": true, "清冊製作與管理": true }) && (
            <li className="p-2">
              <button
                onClick={() => toggleMenu("construction")}
                className="w-full font-bold text-xl text-left flex items-center"
              >
                <img src="/Images/icon_3.png" alt="Construction" className="w-5 h-5 mr-2" />
                施工
              </button>
              <ul className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${
                openMenus.construction ? "max-h-40" : "max-h-0"
              }`}>
                {hasPermission("施工", "案件管理") && (
                  <li className="p-2 flex items-center">
                    <Link to="/construction/case-management" className="hover:font-bold hover:underline">
                      案件管理
                    </Link>
                  </li>
                )}
                {hasPermission("施工", "自主檢查表") && (
                  <li className="p-2 flex items-center">
                    <Link to="/construction/self-inspection" className="hover:font-bold hover:underline">
                      自主檢查表
                    </Link>
                  </li>
                )}
                {hasPermission("施工", "清冊製作與管理") && (
                  <li className="p-2 flex items-center">
                    <Link to="/construction/roster-production" className="hover:font-bold hover:underline">
                      清冊製作與管理
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          )}

          {hasPermission("請款", "請款") && (
            <li className="p-2 flex items-center font-bold text-xl">
              <img src="/Images/icon_4.png" alt="Payment" className="w-5 h-5 mr-2" />
              <Link to="/payment" className="hover:font-bold hover:underline">
                請款
              </Link>
            </li>
          )}

          {hasAnySubPermissions("圖台", {
            "即時車輛軌跡與影像": true,
            "歷史軌跡查詢與下載": true,
            "案件查詢後呈現": true,
            "車隊巡查覆蓋率": true
          }) && (
            <li className="p-2">
              <button
                onClick={() => toggleMenu("map")}
                className="w-full font-bold text-xl text-left flex items-center"
              >
                <img src="/Images/icon_5.png" alt="Map" className="w-5 h-5 mr-2" />
                圖台
              </button>
              <ul className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${
                openMenus.map ? "max-h-60" : "max-h-0"
              }`}>
                {hasPermission("圖台", "即時車輛軌跡與影像") && (
                  <li className="p-2 flex items-center">
                    <Link to="/map/real-time-vehicle" className="hover:font-bold hover:underline">
                      即時車輛軌跡與影像
                    </Link>
                  </li>
                )}
                {hasPermission("圖台", "歷史軌跡查詢與下載") && (
                  <li className="p-2 flex items-center">
                    <Link to="/map/historical-track" className="hover:font-bold hover:underline">
                      歷史軌跡查詢與下載
                    </Link>
                  </li>
                )}
                {hasPermission("圖台", "案件查詢後呈現") && (
                  <li className="p-2 flex items-center">
                    <Link to="/map/case-display" className="hover:font-bold hover:underline">
                      案件查詢後呈現
                    </Link>
                  </li>
                )}
                {hasPermission("圖台", "車隊巡查覆蓋率") && (
                  <li className="p-2 flex items-center">
                    <Link to="/map/fleet-coverage" className="hover:font-bold hover:underline">
                      車隊巡查覆蓋率
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          )}

          {hasAnySubPermissions("道路履歷", {
            "AAR道路區塊": true,
            "PC道路區塊": true,
            "EPC道路區塊": true
          }) && (
            <li className="p-2">
              <button
                onClick={() => toggleMenu("roadHistory")}
                className="w-full font-bold text-xl text-left flex items-center"
              >
                <img src="/Images/icon_6.png" alt="Road History" className="w-5 h-5 mr-2" />
                道路履歷
              </button>
              <ul className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${
                openMenus.roadHistory ? "max-h-40" : "max-h-0"
              }`}>
                {hasPermission("道路履歷", "AAR道路區塊") && (
                  <li className="p-2 flex items-center">
                    <Link to="/road-history/aar" className="hover:font-bold hover:underline">
                      AAR道路區塊
                    </Link>
                  </li>
                )}
                {hasPermission("道路履歷", "PC道路區塊") && (
                  <li className="p-2 flex items-center">
                    <Link to="/road-history/pc" className="hover:font-bold hover:underline">
                      PC道路區塊
                    </Link>
                  </li>
                )}
                {hasPermission("道路履歷", "EPC道路區塊") && (
                  <li className="p-2 flex items-center">
                    <Link to="/road-history/epc" className="hover:font-bold hover:underline">
                      EPC道路區塊
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          )}

          {hasPermission("查詢統計", "查詢統計") && (
            <li className="p-2">
              <button
                onClick={() => toggleMenu("statistics")}
                className="w-full font-bold text-xl text-left flex items-center"
              >
                <img src="/Images/icon_7.png" alt="Statistics" className="w-5 h-5 mr-2" />
                查詢統計
              </button>
              <ul className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${
                openMenus.statistics ? "max-h-40" : "max-h-0"
              }`}>
                <li className="p-2 flex items-center">
                  <Link to="/statistics/monthly" className="hover:font-bold hover:underline">
                    月度統計
                  </Link>
                </li>
                <li className="p-2 flex items-center">
                  <Link to="/statistics/yearly" className="hover:font-bold hover:underline">
                    年度統計
                  </Link>
                </li>
              </ul>
            </li>
          )}

          {hasAnySubPermissions("系統管理", {
            "標案管理": true,
            "公司車隊管理": true,
            "工務帳號管理": true,
            "共用代碼管理": true,
            "選單權限管理": true,
            "系統異動紀錄": true
          }) && (
            <li className="p-2">
              <button
                onClick={() => toggleMenu("systemManagement")}
                className="w-full font-bold text-xl text-left flex items-center"
              >
                <img src="/Images/icon_8.png" alt="System Management" className="w-5 h-5 mr-2" />
                系統管理
              </button>
              <ul className={`ml-4 mt-2 overflow-hidden linear transition-all duration-500 ${
                openMenus.systemManagement ? "max-h-80" : "max-h-0"
              }`}>
                {hasPermission("系統管理", "標案管理") && (
                  <li className="p-2 flex items-center">
                    <Link to="/system-management/bidding" className="hover:font-bold hover:underline">
                      標案管理
                    </Link>
                  </li>
                )}
                {hasPermission("系統管理", "公司車隊管理") && (
                  <li className="p-2 flex items-center">
                    <Link to="/system-management/fleet" className="hover:font-bold hover:underline">
                      公司車隊管理
                    </Link>
                  </li>
                )}
                {hasPermission("系統管理", "工務帳號管理") && (
                  <li className="p-2 flex items-center">
                    <Link to="/system-management/work-account" className="hover:font-bold hover:underline">
                      工務帳號管理
                    </Link>
                  </li>
                )}
                {hasPermission("系統管理", "共用代碼管理") && (
                  <li className="p-2 flex items-center">
                    <Link to="/system-management/shared-code" className="hover:font-bold hover:underline">
                      共用代碼管理
                    </Link>
                  </li>
                )}
                {hasPermission("系統管理", "選單權限管理") && (
                  <li className="p-2 flex items-center">
                    <Link to="/system-management/menu-permission" className="hover:font-bold hover:underline">
                      選單權限管理
                    </Link>
                  </li>
                )}
                {hasPermission("系統管理", "系統異動紀錄") && (
                  <li className="p-2 flex items-center">
                    <Link to="/system-management/change-log" className="hover:font-bold hover:underline">
                      系統異動紀錄
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;