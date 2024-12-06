import React, { useEffect, useState } from "react";
import { url } from "../assets/url";

function EditModal({
  isOpen,
  onClose,
  onConfirm,
  defaultValues,
  fieldMapping,
}) {
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
    const reversedData = Object.keys(formData).reduce((acc, key) => {
      const originalKey = Object.keys(fieldMapping).find(
        (k) => fieldMapping[k] === key
      );
      acc[originalKey || key] = formData[key];
      return acc;
    }, {});
    onConfirm(reversedData); // 傳回翻譯回英文的數據
    onClose(); // 關閉模態框
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-100 rounded-md p-6 w-[1200px] max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-semibold mb-4">編輯資訊</h2>
        {/* Text Fields */}
        <div className="grid grid-cols-3 gap-4">
          {Object.keys(formData).map(
            (key) =>
              key !== "施工前遠景照片" &&
              key !== "施工後遠景照片" && (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {key}
                  </label>
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

        {/* Images Section */}
        <div className="mt-6 flex">
          {["施工前遠景照片", "施工後遠景照片"].map(
            (key) =>
              formData[key] && (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium mb-1 mx-5">
                    {key}
                  </label>
                  <img
                    src={`${url}/files/img/${formData[key]}`}
                    alt="縮圖"
                    className="w-64 h-32 object-contain border mx-5"
                  />
                </div>
              )
          )}
        </div>

        {/* Action Buttons */}
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
