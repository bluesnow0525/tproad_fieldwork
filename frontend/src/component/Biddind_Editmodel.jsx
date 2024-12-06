import React, { useState, useEffect } from "react";

function EditModal({ isOpen, onClose, selectedItem, onSave }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  // 當 selectedItem 改變時，更新 formData
  useEffect(() => {
    if (selectedItem) {
      setFormData({ ...selectedItem });
    } else {
      // 初始化為空數據
      setFormData({
        caseCode: "",
        caseName: "",
        vendor: "",
        contactPerson: "",
        contactPhone: "",
        contractStart: "",
        contractEnd: "",
        notes: "",
      });
    }
  }, [selectedItem]);

  // 格式化日期為 YYYY-MM-DD（用於 <input type="date">）
  const formatDateToInput = (dateString) => {
    if (!dateString) return ""; // 若無日期，返回空字串
    const parts = dateString.split("/");
    if (parts.length !== 3) return ""; // 確保日期有 3 部分
    const [year, month, day] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // 格式化日期為 YYYY/MM/DD（用於存回後端）
  const formatDateFromInput = (dateString) => {
    if (!dateString) return ""; // 若無日期，返回空字串
    const parts = dateString.split("-");
    if (parts.length !== 3) return ""; // 確保日期有 3 部分
    const [year, month, day] = parts;
    return `${year}/${month}/${day}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 日期欄位格式化為 YYYY/MM/DD
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

  // 新增驗證機制：確認是否所有欄位都有值
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

    return ""; // 若無錯誤，返回空字串
  };

  const handleSave = () => {
    // 進行表單驗證
    const validationError = validateForm();
    if (validationError) {
      setError(validationError); // 顯示錯誤訊息
      return;
    }

    setError(""); // 清除錯誤訊息
    onSave(formData); // 儲存時傳回處理好的 formData
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-[600px]">
        <h3 className="text-lg font-semibold mb-4">
          {selectedItem ? "編輯標案" : "新增標案"}
        </h3>

        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col">
            專案代碼
            <input
              type="text"
              name="caseCode"
              value={formData.caseCode || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            案名
            <input
              type="text"
              name="caseName"
              value={formData.caseName || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            負責廠商
            <input
              type="text"
              name="vendor"
              value={formData.vendor || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            聯絡人
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            聯絡電話
            <input
              type="text"
              name="contactPhone"
              value={formData.contactPhone || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            合約開始
            <input
              type="date"
              name="contractStart"
              value={formatDateToInput(formData.contractStart) || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            合約結束
            <input
              type="date"
              name="contractEnd"
              value={formatDateToInput(formData.contractEnd) || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col col-span-2">
            備註
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className="p-2 bg-green-500 text-white rounded"
            onClick={handleSave}
          >
            儲存
          </button>
          <button className="p-2 bg-gray-300 rounded" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
