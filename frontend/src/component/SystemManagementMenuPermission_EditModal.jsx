import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

function SystemManagementMenuPermissionEditModal({ isOpen, onClose, selectedItem, onSave }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});

  const roles = [
    { key: "A01", value: "系統管理員" },
    { key: "A02", value: "公務人員" },
    { key: "A03", value: "合約廠商-管理員" },
    { key: "A04", value: "合約廠商" }
  ];

  useEffect(() => {
    const initialData = selectedItem ? {
      ...selectedItem
    } : {
      msid: "",
      roleName: "",
      operator: user?.username || "",
    };

    setFormData(initialData);
    setOriginalData(initialData);
  }, [selectedItem, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "roleName") {
      const selectedRole = roles.find(role => role.value === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        msid: selectedRole ? selectedRole.key : ""
      }));
    } else if (name === "msid") {
      const selectedRole = roles.find(role => role.key === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        roleName: selectedRole ? selectedRole.value : ""
      }));
    }
  };

  const handleReset = () => {
    setFormData({ ...originalData });
  };

  const handleSave = () => {
    if (!formData.msid || !formData.roleName) {
      alert("請填寫所有必填欄位！");
      return;
    }

    const formattedData = {
      ...formData,
      operator: user?.username,
    };
    onSave(formattedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-[500px]">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          {selectedItem ? "編輯權限" : "新增權限"}
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">權限代碼</span>
            <select
              name="msid"
              value={formData.msid || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">請選擇權限代碼</option>
              {roles.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.key}
                </option>
              ))}
            </select>
          </label>
          
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">權限名稱</span>
            <input
              type="text"
              name="roleName"
              value={formData.roleName || ""}
              readOnly
              className="p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          {selectedItem && (
            <>
              <label className="flex flex-col">
                <span className="text-gray-700 mb-1">異動人員</span>
                <input
                  type="text"
                  value={formData.operator || ""}
                  readOnly
                  className="p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-gray-700 mb-1">異動日期</span>
                <input
                  type="text"
                  value={formData.lastModifiedTime || ""}
                  readOnly
                  className="p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            onClick={handleReset}
          >
            重新輸入
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleSave}
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
}

export default SystemManagementMenuPermissionEditModal;