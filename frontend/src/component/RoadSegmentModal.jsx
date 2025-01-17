import React, { useState, useEffect } from "react";
import { url } from "../assets/url";

const RoadSegmentModal = ({ isOpen, onClose, onConfirm, selectedItems }) => {
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [roadSegments, setRoadSegments] = useState([]);
  const [selectedRoadSegment, setSelectedRoadSegment] = useState("");

  // In RoadSegmentModal component, modify the useEffect:
  useEffect(() => {
    if (district && category) {
      fetch(`${url}/caseinfor/road-segments/${district}?category=${category}`)
        .then((response) => response.json())
        .then((data) => {
          setRoadSegments(data);
        })
        .catch((error) =>
          console.error("Error fetching road segments:", error)
        );
    }
  }, [district, category]); // Add category to dependency array

  const handleSubmit = () => {
    if (!district || !category || !selectedRoadSegment) {
      alert("請填寫所有必填欄位");
      return;
    }

    const updatedItems = selectedItems.map((caid) => ({
      caid,
      result: "是",
      district: district,
      caRoad: selectedRoadSegment,
    }));

    onConfirm(updatedItems);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">巡查路段</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            行政區
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
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

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            分類
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="8上"
                checked={category === "8上"}
                onChange={(e) => setCategory(e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">8上</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="8下"
                checked={category === "8下"}
                onChange={(e) => setCategory(e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">8下</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="步巡"
                checked={category === "步巡"}
                onChange={(e) => setCategory(e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">步巡</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="地下道高架橋"
                checked={category === "地下道高架橋"}
                onChange={(e) => setCategory(e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">地下道高架橋</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            路段
          </label>
          <select
            value={selectedRoadSegment}
            onChange={(e) => setSelectedRoadSegment(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">請選擇</option>
            {roadSegments.map((segment) => (
              <option key={segment.value} value={segment.value}>
                {segment.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            確認
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoadSegmentModal;
