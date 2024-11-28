import React, { useState } from "react";

function EditModal({ isOpen, onClose, selectedItem, onSave }) {
  const [formData, setFormData] = useState({ ...selectedItem });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-[600px]">
        <h3 className="text-lg font-semibold mb-4">編輯標案</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col">
            專案代碼
            <input
              type="text"
              name="caseCode"
              value={formData.caseCode}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            案名
            <input
              type="text"
              name="caseName"
              value={formData.caseName}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            負責廠商
            <input
              type="text"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            聯絡人
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            聯絡電話
            <input
              type="text"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            合約開始
            <input
              type="date"
              name="contractStart"
              value={formData.contractStart}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            合約結束
            <input
              type="date"
              name="contractEnd"
              value={formData.contractEnd}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col col-span-2">
            備註
            <textarea
              name="notes"
              value={formData.notes}
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
