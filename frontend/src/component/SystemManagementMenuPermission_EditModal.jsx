import React, { useState, useEffect } from "react";
import { url } from "../assets/url";
import { useAuth } from "../contexts/AuthContext";

const SystemManagementMenuPermissionEditModal = ({
  isOpen,
  onClose,
  selectedItem,
  onSave,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    msid: "",
    roleName: "",
    operator: user?.username || "",
    permissions: {
      "案件管理": {
        "案件管理": false,
        "報表作業": false,
      },
      "申請單": {
        "案件管理": false,
        "清冊管理": false,
      },
      "施工": {
        "案件管理": false,
        "自主檢查表": false,
        "清冊製作與管理": false,
      },
      "請款": {
        "請款": false,
      },
      "圖台": {
        "即時車輛軌跡與影像": false,
        "歷史軌跡查詢與下載": false,
        "案件查詢後呈現": false,
        "車隊巡查覆蓋率": false,
      },
      "道路履歷": {
        "AAR道路區塊": false,
        "PC道路區塊": false,
        "EPC道路區塊": false,
      },
      "查詢統計": {
        "查詢統計": false,
      },
      "系統管理": {
        "標案管理": false,
        "公司車隊管理": false,
        "工務帳號管理": false,
        "共用代碼管理": false,
        "選單權限管理": false,
        "系統異動紀錄": false,
      }
    },
  });

  const permissionOrder = [
    "案件管理",
    "申請單",
    "施工",
    "請款",
    "圖台",
    "道路履歷",
    "查詢統計",
    "系統管理"
  ];

  // 定義每個類別中子項目的順序
  const subPermissionOrder = {
    "案件管理": ["案件管理", "報表作業"],
    "申請單": ["案件管理", "清冊管理"],
    "施工": ["案件管理", "自主檢查表", "清冊製作與管理"],
    "請款": ["請款"],
    "圖台": ["即時車輛軌跡與影像", "歷史軌跡查詢與下載", "案件查詢後呈現", "車隊巡查覆蓋率"],
    "道路履歷": ["AAR道路區塊", "PC道路區塊", "EPC道路區塊"],
    "查詢統計": ["查詢統計"],
    "系統管理": ["標案管理", "公司車隊管理", "工務帳號管理", "共用代碼管理", "選單權限管理", "系統異動紀錄"]
  };

  const [defaultPermissions, setDefaultPermissions] = useState(null);

  // 當組件加載時獲取預設權限結構
  useEffect(() => {
    fetch(`${url}/permission/default`)
      .then(response => response.json())
      .then(data => {
        setDefaultPermissions(data.permissions);
        // 如果不是編輯模式，使用預設權限初始化
        if (!selectedItem) {
          setFormData(prev => ({
            ...prev,
            permissions: data.permissions
          }));
        }
      })
      .catch(error => console.error("Error fetching default permissions:", error));
  }, []);

  // 當選中項目改變時更新表單數據
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        msid: selectedItem.msid || "",
        roleName: selectedItem.roleName || "",
        operator: user?.username || "",
        permissions: selectedItem.permissions || { ...formData.permissions },
      });
    } else {
      setFormData(prev => ({
        msid: "",
        roleName: "",
        operator: user?.username || "",
        permissions: { ...prev.permissions },
      }));
    }
  }, [selectedItem, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (category, item) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: {
          ...prev.permissions[category],
          [item]: !prev.permissions[category]?.[item],
        },
      },
    }));
  };

  // 處理類別全選
  const handleCategorySelectAll = (category) => {
    const categoryItems = formData.permissions[category];
    const allChecked = categoryItems && Object.values(categoryItems).every((value) => value);
    
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: Object.keys(prev.permissions[category]).reduce((acc, item) => ({
          ...acc,
          [item]: !allChecked,
        }), {}),
      },
    }));
  };

  // 檢查類別是否全選
  const isCategoryAllSelected = (category) => {
    const categoryItems = formData.permissions[category];
    return categoryItems && Object.values(categoryItems).every((value) => value);
  };

  const handleReset = () => {
    if (!selectedItem && defaultPermissions) {
      setFormData({
        msid: "",
        roleName: "",
        operator: user?.username || "",
        permissions: defaultPermissions,
      });
    } else if (selectedItem) {
      setFormData({
        msid: selectedItem.msid || "",
        roleName: selectedItem.roleName || "",
        operator: user?.username || "",
        permissions: selectedItem.permissions || {},
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.msid || !formData.roleName) {
      alert("請填寫權限代碼和權限名稱！");
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {!selectedItem ? "新增權限" : "編輯權限"}
        </h2>

        <div className="mb-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">權限代碼</label>
              <input
                type="text"
                name="msid"
                value={formData.msid}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={selectedItem}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">權限名稱</label>
              <input
                type="text"
                name="roleName"
                value={formData.roleName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={selectedItem}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {permissionOrder.map((category) => (
              <div key={category} className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={isCategoryAllSelected(category)}
                    onChange={() => handleCategorySelectAll(category)}
                    className="mr-2"
                  />
                  <h3 className="font-semibold">{category}</h3>
                </div>
                {subPermissionOrder[category].map((item) => (
                  <div key={item} className="flex items-center mb-2 ml-6">
                    <input
                      type="checkbox"
                      id={`${category}-${item}`}
                      checked={formData.permissions[category]?.[item] || false}
                      onChange={() => handleCheckboxChange(category, item)}
                      className="mr-2"
                    />
                    <label htmlFor={`${category}-${item}`}>{item}</label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            取消
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            重新輸入
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemManagementMenuPermissionEditModal;