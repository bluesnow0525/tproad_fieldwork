import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

function WorkAccountEditModal({ isOpen, onClose, selectedItem, onSave }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});

  const accountTypes = ["系統管理員", "公務人員"];
  const vendorOptions = [
    "臺北市政府",
    "公所",
    "養⼯處",
    "合約公司"
  ];

  useEffect(() => {
    const initialData = selectedItem
      ? {
          ...selectedItem,
          createdDate: selectedItem.createdDate
            ? selectedItem.createdDate.replace(/\//g, "-")
            : "",
        }
      : {
          status: "啟用",
          vendor: "",
          account: "",
          name: "",
          msid: "",
          password: "",
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

  const handleReset = () => {
    setFormData({ ...originalData });
  };

  const handleSave = () => {
    if (!formData.vendor || !formData.account || !formData.name || !formData.msid) {
      alert("請填寫所有必填欄位！");
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
          {selectedItem ? "編輯工務帳號" : "新增工務帳號"}
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
            <span className="text-gray-700 mb-1">所屬單位</span>
            <select
              name="vendor"
              value={formData.vendor || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">請選擇</option>
              {vendorOptions.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
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

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">帳號類別</span>
            <select
              name="msid"
              value={formData.msid || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">請選擇</option>
              {accountTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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

export default WorkAccountEditModal;
