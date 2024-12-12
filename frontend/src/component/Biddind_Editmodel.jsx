import React, { useState, useEffect } from "react";

function EditModal({ isOpen, onClose, selectedItem, onSave }) {
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedItem) {
      setFormData({ ...selectedItem });
      setOriginalData({ ...selectedItem }); // Store original data for reset
    } else {
      const initialData = {
        caseCode: "",
        caseName: "",
        vendor: "",
        contactPerson: "",
        contactPhone: "",
        contractStart: "",
        contractEnd: "",
        notes: "",
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [selectedItem]);

  const formatDateToInput = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("/");
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const formatDateFromInput = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    return `${year}/${month}/${day}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contractStart" || name === "contractEnd") {
      setFormData((prev) => ({
        ...prev,
        [name]: formatDateFromInput(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "caseCode",
      "caseName",
      "vendor",
      "contactPerson",
      "contractStart",
      "contractEnd",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        return `欄位 ${field} 不能為空`;
      }
    }
    return "";
  };

  const handleSave = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    onSave(formData);
  };

  const handleReset = () => {
    setFormData({ ...originalData });
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-[600px]">
        <h3 className="text-xl font-semibold mb-6">
          {selectedItem ? "編輯標案" : "新增標案"}
        </h3>

        {error && (
          <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">專案代碼</span>
            <input
              type="text"
              name="caseCode"
              value={formData.caseCode || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">案名</span>
            <input
              type="text"
              name="caseName"
              value={formData.caseName || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">負責廠商</span>
            <input
              type="text"
              name="vendor"
              value={formData.vendor || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">聯絡人</span>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">聯絡電話</span>
            <input
              type="text"
              name="contactPhone"
              value={formData.contactPhone || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">合約開始</span>
            <input
              type="date"
              name="contractStart"
              value={formatDateToInput(formData.contractStart) || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-gray-700 mb-1">合約結束</span>
            <input
              type="date"
              name="contractEnd"
              value={formatDateToInput(formData.contractEnd) || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </label>
          <label className="flex flex-col col-span-2">
            <span className="text-gray-700 mb-1">備註</span>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[100px]"
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

export default EditModal;