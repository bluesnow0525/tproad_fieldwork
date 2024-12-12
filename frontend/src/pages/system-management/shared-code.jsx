import React, { useState, useEffect } from "react";
import { url } from "../../assets/url";
import PaginationComponent from "../../component/Pagination";
import SharedCodeEditModal from "../../component/SharedCode_EditModal";

function SystemManagementSharedCode() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    usable: "",
    codeNo: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${url}/sharedcode/read`);
      if (!response.ok) {
        throw new Error("網路響應錯誤");
      }
      const jsonData = await response.json();
      setData(jsonData);
      setFilteredData(jsonData);
    } catch (error) {
      console.error("讀取資料錯誤:", error);
      alert("讀取資料發生錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (filters.usable) {
      // 根據類別名稱篩選
      filtered = filtered.filter(
        (item) => item.categoryName === filters.usable
      );
    }
    if (filters.codeNo) {
      filtered = filtered.filter(
        (item) =>
          item.sharedCode.includes(filters.codeNo) ||
          item.codeName.includes(filters.codeNo)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!selectedItems.length) {
      alert("請先勾選要刪除的項目");
      return;
    }

    if (!window.confirm("確定要刪除所選項目嗎？")) {
      return;
    }

    try {
      const response = await fetch(`${url}/sharedcode/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedItems }),
      });

      if (!response.ok) {
        throw new Error("刪除失敗");
      }

      await fetchData();
      setSelectedItems([]);
      setSelectAll(false);
      alert("刪除成功");
    } catch (error) {
      console.error("刪除錯誤:", error);
      alert("刪除失敗，請稍後再試");
    }
  };

  const handleSave = async (formData) => {
    try {
      const response = await fetch(`${url}/sharedcode/write`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("儲存失敗");
      }

      await fetchData();
      closeModal();
      alert("儲存成功");
    } catch (error) {
      console.error("儲存錯誤:", error);
      alert("儲存失敗，請稍後再試");
    }
  };

  const openModal = (item = null) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const toggleSelectAll = () => {
    const currentPageItems = paginatedData.map((item) => item.id);
    setSelectAll(!selectAll);
    setSelectedItems(!selectAll ? currentPageItems : []);
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setSelectAll(false);
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 獲取唯一的類別名稱列表
  const getUniqueCategories = (data) => {
    const categories = new Set(data.map((item) => item.categoryName));
    return Array.from(categories).filter(Boolean).sort(); // 過濾掉空值並排序
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-md shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-4">
          系統管理 &gt; 共用代碼管理
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <select
            name="usable"
            value={filters.usable}
            onChange={handleFilterChange}
            className="p-2 border rounded w-32"
          >
            <option value="">類別</option>
            {getUniqueCategories(data).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="codeNo"
            placeholder="代碼名稱"
            value={filters.codeNo}
            onChange={handleFilterChange}
            className="p-2 border rounded w-48"
          />
          <button
            onClick={applyFilters}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
          >
            <img
              src="/Images/icon-search.png"
              alt="search"
              className="h-5 w-5 mr-1"
            />
            查詢
          </button>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <button
            onClick={handleDelete}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            刪除
          </button>
          <button
            onClick={() => openModal()}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            新增
          </button>
        </div>
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={Math.ceil(filteredData.length / itemsPerPage)}
        setCurrentPage={setCurrentPage}
        totalItems={filteredData.length}
      />

      <div className="bg-white rounded-md shadow-md overflow-hidden mt-4">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-200">
              <th className="w-16 p-3 text-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="w-24 p-3 text-center">使用</th>
              <th className="w-24 p-3 text-center">順序</th>
              <th className="w-32 p-3 text-center">類別代碼</th>
              <th className="w-32 p-3 text-center">類別名稱</th>
              <th className="w-32 p-3 text-center">共用代碼</th>
              <th className="p-3 text-center">代碼名稱</th>
              <th className="w-32 p-3 text-center">異動人員</th>
              <th className="w-40 p-3 text-center">異動日期</th>
              <th className="w-24 p-3 text-center">維護</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="p-3 text-center">{item.usable}</td>
                <td className="p-3 text-center">{item.order}</td>
                <td className="p-3 text-center">{item.categoryCode}</td>
                <td className="p-3 text-center">{item.categoryName}</td>
                <td className="p-3 text-center">{item.sharedCode}</td>
                <td className="p-3 text-center">{item.codeName}</td>
                <td className="p-3 text-center">{item.modifier}</td>
                <td className="p-3 text-center">{item.modifyDate}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => openModal(item)}
                    className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    編輯
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

      <SharedCodeEditModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedItem={selectedItem}
        onSave={handleSave}
      />
    </div>
  );
}

export default SystemManagementSharedCode;
