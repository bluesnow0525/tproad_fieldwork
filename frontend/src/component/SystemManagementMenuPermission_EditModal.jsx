import React, { useState, useEffect } from "react";
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
    operator: "system",
    permissions: {
      案件管理: {
        案件管理: false,
        表格作業: false,
        報表作業: false,
      },
      申請單: {
        案件管理: false,
        清冊管理: false,
      },
      施工: {
        案件管理: false,
        自主檢查表: false,
        清冊製作與管理: false,
      },
      請款: {
        請款: false,
      },
      總台: {
        即時車輛軌跡與影像: false,
        歷史軌跡查詢與下載: false,
        案件查詢後呈現: false,
        車隊巡查覆蓋率: false,
      },
      道路履歷: {
        AAR道路區塊: false,
        PC道路區塊: false,
        EPC道路區塊: false,
      },
      查詢統計: {
        查詢統計: false,
      },
      系統管理: {
        標案管理: false,
        公司車隊管理: false,
        工務帳號管理: false,
        共用代碼管理: false,
        選單權限管理: false,
        系統更動紀錄: false,
      },
    },
  });

  const isAddMode = !selectedItem;

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        msid: selectedItem.msid || "",
        roleName: selectedItem.roleName || "",
        operator: user?.username,
        permissions: selectedItem.permissions || formData.permissions,
      });
    } else {
      // Reset form for add mode
      setFormData({
        msid: "",
        roleName: "",
        operator: user?.username,
        permissions: formData.permissions,
      });
    }
  }, [selectedItem]);

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
          [item]: !prev.permissions[category][item],
        },
      },
    }));
  };

  const handleReset = () => {
    if (isAddMode) {
      setFormData({
        msid: "",
        roleName: "",
        operator: "system",
        permissions: formData.permissions,
      });
    } else {
      setFormData({
        ...selectedItem,
        permissions: formData.permissions,
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
          {isAddMode ? "新增權限" : "編輯權限"}
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
                disabled={!isAddMode}
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
              />
            </div>
          </div>

          {!isAddMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(formData.permissions).map(([category, items]) => (
                <div key={category} className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{category}</h3>
                  {Object.entries(items).map(([item, checked]) => (
                    <div key={item} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`${category}-${item}`}
                        checked={checked}
                        onChange={() => handleCheckboxChange(category, item)}
                        className="mr-2"
                      />
                      <label htmlFor={`${category}-${item}`}>{item}</label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
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
