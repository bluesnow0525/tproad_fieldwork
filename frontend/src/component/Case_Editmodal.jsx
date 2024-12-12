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
  const [originalData, setOriginalData] = useState({});
  const [newImages, setNewImages] = useState({
    photoBefore: null,
    photoAfter: null
  });

  useEffect(() => {
    if (isOpen && defaultValues) {
      setFormData({ ...defaultValues });
      setOriginalData({ ...defaultValues });
      setNewImages({
        photoBefore: null,
        photoAfter: null
      });
    }
  }, [isOpen, defaultValues]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImages(prev => ({
          ...prev,
          [fieldName === "施工前遠景照片" ? "photoBefore" : "photoAfter"]: {
            file,
            preview: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    const formDataToSend = new FormData();
    
    // 將中文欄位名轉換回英文
    const reversedData = Object.keys(formData).reduce((acc, key) => {
      const originalKey = Object.keys(fieldMapping).find(
        (k) => fieldMapping[k] === key
      );
      if (originalKey) {
        acc[originalKey] = formData[key];
      }
      return acc;
    }, {});

    // 添加基本資料
    Object.keys(reversedData).forEach(key => {
      formDataToSend.append(key, reversedData[key]);
    });

    // 添加新上傳的圖片
    if (newImages.photoBefore?.file) {
      formDataToSend.append('photoBefore', newImages.photoBefore.file);
    }
    if (newImages.photoAfter?.file) {
      formDataToSend.append('photoAfter', newImages.photoAfter.file);
    }

    onConfirm(formDataToSend);
    onClose();
  };

  const handleReset = () => {
    setFormData({ ...originalData });
    setNewImages({
      photoBefore: null,
      photoAfter: null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-[1200px] max-h-[90vh] overflow-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">編輯資訊</h2>
        
        {/* Text Fields */}
        <div className="grid grid-cols-3 gap-6">
          {Object.keys(formData).map(
            (key) =>
              key !== "施工前遠景照片" &&
              key !== "施工後遠景照片" && (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {key}
                  </label>
                  <input
                    type="text"
                    name={key}
                    value={formData[key] || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                </div>
              )
          )}
        </div>

        {/* Images Section */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          {["施工前遠景照片", "施工後遠景照片"].map((key) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {key}
              </label>
              <div className="space-y-4">
                <div className="h-48 w-full border rounded-lg overflow-hidden bg-gray-50">
                  {(newImages[key === "施工前遠景照片" ? "photoBefore" : "photoAfter"]?.preview || 
                    (formData[key] && `${url}/files/img/${formData[key]}`)) ? (
                    <img
                      src={newImages[key === "施工前遠景照片" ? "photoBefore" : "photoAfter"]?.preview || 
                           `${url}/files/img/${formData[key]}`}
                      alt={key}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      無圖片
                    </div>
                  )}
                </div>
                <div className="flex justify-start">
                  <label className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, key)}
                      className="hidden"
                    />
                    {formData[key] ? "更換圖片" : "上傳圖片"}
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            重新輸入
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;