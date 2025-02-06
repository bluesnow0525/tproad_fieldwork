import React, { useState } from 'react';

const DistrictModal = ({ isOpen, onClose, onConfirm }) => {
  const [selectedDistrict, setSelectedDistrict] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedDistrict) {
      alert('請選擇行政區！');
      return;
    }
    onConfirm(selectedDistrict);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">批次修改行政區</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            行政區
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">請選擇</option>
            <option value="中正區">中正區</option>
            <option value="大同區">大同區</option>
            <option value="中山區">中山區</option>
            <option value="松山區">松山區</option>
            <option value="大安區">大安區</option>
            <option value="萬華區">萬華區</option>
            <option value="信義區">信義區</option>
            <option value="士林區">士林區</option>
            <option value="北投區">北投區</option>
            <option value="內湖區">內湖區</option>
            <option value="南港區">南港區</option>
            <option value="文山區">文山區</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            確認
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default DistrictModal;