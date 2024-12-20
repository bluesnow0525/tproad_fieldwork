import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

function SharedCodeEditModal({ isOpen, onClose, selectedItem, onSave }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    if (selectedItem) {
      setFormData({ ...selectedItem });
      setOriginalData({ ...selectedItem });
    } else {
      const initialData = {
        usable: "是",
        order: "",
        categoryCode: "",
        categoryName: "",
        sharedCode: "",
        codeName: "",
        modifier: "system",
        modifyDate: new Date().toISOString().split("T")[0]
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [selectedItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    setFormData({ ...originalData });
  };

  const handleSave = () => {
    if (!formData.categoryCode || !formData.categoryName || !formData.sharedCode || !formData.codeName) {
      alert("請填寫所有必填欄位！");
      return;
    }

    const formattedData = {
      ...formData,
      modifier: user?.username,
    };

    onSave(formattedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-[600px]">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          {selectedItem ? "編輯共用代碼" : "新增共用代碼"}
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">使用狀態</span>
            <select
              name="usable"
              value={formData.usable || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="是">是</option>
              <option value="否">否</option>
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">順序</span>
            <input
              type="number"
              name="order"
              value={formData.order || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">類別代碼</span>
            <input
              type="text"
              name="categoryCode"
              value={formData.categoryCode || ""}
              onChange={handleChange}
              readOnly
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">類別名稱</span>
            <input
              type="text"
              name="categoryName"
              value={formData.categoryName || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">共用代碼</span>
            <input
              type="text"
              name="sharedCode"
              value={formData.sharedCode || ""}
              onChange={handleChange}
              readOnly
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">代碼名稱</span>
            <input
              type="text"
              name="codeName"
              value={formData.codeName || ""}
              onChange={handleChange}
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

export default SharedCodeEditModal;