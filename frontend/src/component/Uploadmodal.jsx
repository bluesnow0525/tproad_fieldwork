import React from 'react';

function UploadModal({ isOpen, onClose, onConfirm, uploadFiles, handleFileChange, selectedItem }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg p-8 w-[500px]">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">修正報表</h3>
          <p>日期：{selectedItem?.reportDate || "N/A"}</p>
        </div>
        {["appLog", "appResult", "carLog", "carResult", "motorcycleLog", "motorcycleResult"].map((field) => (
          <div key={field} className="flex items-center mb-4">
            <label className="w-40">{field}</label>
            <input
              type="file"
              name={field}
              onChange={handleFileChange}
              className="flex-grow border p-2 rounded"
            />
          </div>
        ))}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => onConfirm(selectedItem)}
            className="p-2 bg-green-500 text-white rounded"
          >
            確認
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-blue-500 text-white rounded"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
