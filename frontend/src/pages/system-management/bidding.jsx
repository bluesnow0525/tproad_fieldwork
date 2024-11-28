import React, { useEffect, useState } from "react";
import PaginationComponent from "../../component/Pagination";
import EditModal from "../../component/Biddind_Editmodel";
import { url } from "../../assets/url";

function SystemManagementBidding() {
  const [data, setData] = useState([]); // 原始數據
  const [filteredData, setFilteredData] = useState([]); // 篩選後數據
  const [filters, setFilters] = useState({
    status: "",
    caseCode: "",
    caseName: "",
    dateFrom: "",
    dateTo: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch API 數據
  const fetchData = () => {
    fetch(`${url}/roadcase/read`)
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
        setFilteredData(jsonData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };  

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }
    if (filters.caseCode) {
      filtered = filtered.filter((item) =>
        item.caseCode.includes(filters.caseCode)
      );
    }
    if (filters.caseName) {
      filtered = filtered.filter((item) =>
        item.caseName.includes(filters.caseName)
      );
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (item) => new Date(item.contractStart) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (item) => new Date(item.contractEnd) <= new Date(filters.dateTo)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = (updatedItem) => {
    // 發送更新請求給後端
    fetch(`${url}/roadcase/write`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update item");
        }
        return response.json();
      })
      .then(() => {
        // 更新本地數據
        setData((prevData) =>
          prevData.map((item) =>
            item.rcid === updatedItem.rcid ? updatedItem : item
          )
        );
        setFilteredData((prevFilteredData) =>
          prevFilteredData.map((item) =>
            item.rcid === updatedItem.rcid ? updatedItem : item
          )
        );
        closeModal();
      })
      .catch((error) => console.error("Error updating item:", error));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-md shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-4">系統管理 &gt; 標案管理</h2>
        <div className="flex items-center gap-4 mb-4">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 border rounded w-32"
          >
            <option value="">狀態</option>
            <option value="啟用">啟用</option>
            <option value="停用">停用</option>
          </select>
          <input
            type="text"
            name="caseCode"
            placeholder="專案代碼"
            value={filters.caseCode}
            onChange={handleFilterChange}
            className="p-2 border rounded w-48"
          />
          <input
            type="text"
            name="caseName"
            placeholder="案名"
            value={filters.caseName}
            onChange={handleFilterChange}
            className="p-2 border rounded w-64"
          />
          <input
            type="date"
            name="dateFrom"
            placeholder="起始日期"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="dateTo"
            placeholder="結束日期"
            value={filters.dateTo}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
          <button
            className="p-2 bg-blue-500 text-white rounded shadow"
            onClick={applyFilters}
          >
            查詢
          </button>
        </div>
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={Math.ceil(filteredData.length / itemsPerPage)}
        setCurrentPage={setCurrentPage}
        totalItems={filteredData.length}
      />

      <div className="bg-white rounded-md shadow-md p-4 overflow-x-auto mt-4">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">狀態</th>
              <th className="p-3 border">專案代碼</th>
              <th className="p-3 border">案名</th>
              <th className="p-3 border">負責廠商</th>
              <th className="p-3 border">合約起迄</th>
              <th className="p-3 border">維護</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.rcid} className="hover:bg-gray-100">
                <td className="p-3 border">{item.status}</td>
                <td className="p-3 border">{item.caseCode}</td>
                <td className="p-3 border">{item.caseName}</td>
                <td className="p-3 border">{item.vendor}</td>
                <td className="p-3 border">{item.contractPeriod}</td>
                <td className="p-3 border">
                  <button
                    className="p-2 bg-blue-500 text-white rounded shadow"
                    onClick={() => openModal(item)}
                  >
                    編輯
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <EditModal
          isOpen={isModalOpen}
          onClose={closeModal}
          selectedItem={selectedItem}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default SystemManagementBidding;
