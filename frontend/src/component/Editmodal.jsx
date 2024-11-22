import React, { useEffect, useState } from "react";

function EditModal({ isOpen, onClose, onConfirm, defaultValues }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen && defaultValues) {
      setFormData({ ...defaultValues });
    }
  }, [isOpen, defaultValues]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleConfirm = () => {
    onConfirm(formData); // 傳回更新後的數據
    onClose(); // 關閉模態框
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 w-[800px] max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-semibold mb-4">編輯資訊</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.keys(formData).map(
            (key) =>
              key !== "thumbnail" && ( // 忽略不需要編輯的欄位
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">{key}</label>
                  <input
                    type="text"
                    name={key}
                    value={formData[key] || ""}
                    onChange={handleInputChange}
                    className="p-2 border rounded w-full"
                  />
                </div>
              )
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-black rounded"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
