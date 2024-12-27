import React, { useEffect, useState } from "react";
import PaginationComponent from "../../component/Pagination";
import SystemManagementMenuPermissionEditModal from "../../component/SystemManagementMenuPermission_EditModal";
import { useAuth } from "../../contexts/AuthContext";
import { url } from "../../assets/url";

function SystemManagementMenuPermission() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    msid: "",
    roleName: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Fetch API 數據
  const fetchData = () => {
    fetch(`${url}/permission/read`)
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

    if (filters.msid) {
      filtered = filtered.filter((item) =>
        item.msid.toLowerCase().includes(filters.msid.toLowerCase())
      );
    }
    if (filters.roleName) {
      filtered = filtered.filter((item) =>
        item.roleName.toLowerCase().includes(filters.roleName.toLowerCase())
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
    const endpoint = !selectedItem ? `${url}/permission/add` : `${url}/permission/write`;
    
    fetch(endpoint, {
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
        fetchData();
        closeModal();
        alert(selectedItem ? "更新成功" : "新增成功");
      })
      .catch((error) => {
        console.error("Error saving item:", error);
        alert(selectedItem ? "更新失敗" : "新增失敗");
      });
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allIdsOnPage = paginatedData.map((item) => item.msid);  // 使用 msid 而不是 emid
      setSelectedItems(allIdsOnPage);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectAll(false);
    setSelectedItems((prevSelected) => {
      const newSelected = prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id];
      return newSelected;
    });
  };

  const handleDelete = () => {
    if (!selectedItems.length) {
      alert("請先勾選項目！");
      return;
    }

    const confirmAction = window.confirm("確認刪除選中的項目？");
    if (confirmAction) {
      fetch(`${url}/permission/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emid: selectedItems, operator: user?.username  }),  // 後端期望 emid 參數
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete items");
          }
          return response.json();
        })
        .then(() => {
          fetchData();
          setSelectedItems([]);
          alert("刪除成功");
        })
        .catch((error) => {
          console.error("Error deleting items:", error);
          alert("刪除失敗");
        });
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-md shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-4">系統管理 &gt; 選單權限管理</h2>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            name="msid"
            placeholder="權限代碼"
            value={filters.msid}
            onChange={handleFilterChange}
            className="p-2 border rounded w-48"
          />
          <input
            type="text"
            name="roleName"
            placeholder="權限名稱"
            value={filters.roleName}
            onChange={handleFilterChange}
            className="p-2 border rounded w-48"
          />
          <button
            className="p-2 bg-blue-500 text-white rounded shadow flex"
            onClick={applyFilters}
          >
            <img
              src="/Images/icon-search.png"
              alt="calendar"
              className="h-5 w-5 mr-1"
            />
            查詢
          </button>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <button
            className="p-2 bg-green-500 text-white rounded shadow mr-2"
            onClick={() => openModal(null)}
          >
            新增
          </button>
          <button
            className="p-2 bg-red-500 text-white rounded shadow"
            onClick={handleDelete}
          >
            刪除
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
              <th className="p-3 border">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 border">權限代碼</th>
              <th className="p-3 border">權限名稱</th>
              <th className="p-3 border">異動人員</th>
              <th className="p-3 border">異動日期</th>
              <th className="p-3 border">維護</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.msid} className="hover:bg-gray-100">
                <td className="p-3 border">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.msid)}
                    onChange={() => handleSelectItem(item.msid)}
                  />
                </td>
                <td className="p-3 border">{item.msid}</td>
                <td className="p-3 border">{item.roleName}</td>
                <td className="p-3 border">{item.operator}</td>
                <td className="p-3 border">{item.lastModifiedTime}</td>
                <td className="p-3 border">
                  <button
                    className="p-2 bg-blue-500 text-white rounded shadow"
                    onClick={() => openModal(item)}
                  >
                    編輯權限
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <SystemManagementMenuPermissionEditModal
          isOpen={isModalOpen}
          onClose={closeModal}
          selectedItem={selectedItem}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default SystemManagementMenuPermission;