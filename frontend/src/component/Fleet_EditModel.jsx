import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

function FleetEditModal({ isOpen, onClose, selectedItem, onSave }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});

  const roles = ["公司管理員", "內業人員", "修補人員", "維修人員", "巡查人員"];
  const vendorOptions = [
    { value: "NRP-111-146-001", label: "NRP-111-146-001" },
    { value: "PR001", label: "PR001" },
    { value: "PR002", label: "PR002" }
  ];

  useEffect(() => {
    const initialData = selectedItem ? {
      ...selectedItem,
      createdDate: selectedItem.createdDate
        ? selectedItem.createdDate.replace(/\//g, "-")
        : ""
    } : {
      status: "啟用",
      caseCode: "",
      vendor: "",
      account: "",
      name: "",
      role: [],
      password: "",
      phone: "",
      email: "",
      notes: "",
      passwordErrorCount: 0,
      createdDate: new Date().toISOString().split("T")[0],
    };

    setFormData(initialData);
    setOriginalData(initialData);
  }, [selectedItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "createdDate" ? value.replace(/\//g, "-") : value,
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => {
      const updatedRoles = prev.role.includes(role)
        ? prev.role.filter((r) => r !== role)
        : [...prev.role, role];
      return { ...prev, role: updatedRoles };
    });
  };

  const handleReset = () => {
    setFormData({ ...originalData });
  };

  const handleSave = () => {
    if (!formData.caseCode || !formData.account || !formData.name || formData.role.length === 0) {
      alert("請填寫所有必填欄位，並選擇至少一個角色！");
      console.log(formData)
      return;
    }

    const formattedData = {
      ...formData,
      createdDate: formData.createdDate.replace(/-/g, "/"),
      operator: user?.username,
    };
    onSave(formattedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-[600px]">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          {selectedItem ? "編輯車隊" : "新增車隊"}
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">狀態</span>
            <select
              name="status"
              value={formData.status || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="啟用">啟用</option>
              <option value="停用">停用</option>
            </select>
          </label>
          
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">負責廠商</span>
            <select
              name="caseCode"
              value={formData.caseCode || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">請選擇廠商</option>
              {vendorOptions.map((vendor) => (
                <option key={vendor.value} value={vendor.value}>
                  {vendor.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">帳號</span>
            <input
              type="text"
              name="account"
              value={formData.account || ""}
              onChange={handleChange}
              
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">姓名</span>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>

          <label className="flex flex-col col-span-2">
            <span className="text-gray-700 mb-1">角色</span>
            <div className="grid grid-cols-3 gap-3 p-2 border rounded-md">
              {roles.map((role) => (
                <label key={role} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.role?.includes(role) || false}
                    onChange={() => handleRoleChange(role)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">密碼</span>
            <input
              type="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">電話</span>
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">電子郵件</span>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">備註</span>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">密碼錯誤次數</span>
            <input
              type="number"
              name="passwordErrorCount"
              value={formData.passwordErrorCount || 0}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              min="0"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">建立日期</span>
            <input
              type="date"
              name="createdDate"
              value={formData.createdDate || ""}
              onChange={handleChange}
              readOnly
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            onClick={handleReset}
          >
            重新輸入
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={handleSave}
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
}

export default FleetEditModal;