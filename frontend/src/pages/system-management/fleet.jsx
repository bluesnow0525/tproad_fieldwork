import React, { useEffect, useState } from "react";
import PaginationComponent from "../../component/Pagination";
import FleetEditModal from "../../component/Fleet_EditModel";
import { useAuth } from "../../contexts/AuthContext";
import { url } from "../../assets/url";

function SystemManagementFleet() {
  const { user } = useAuth();
  const [data, setData] = useState([]); // 原始數據
  const [filteredData, setFilteredData] = useState([]); // 篩選後數據
  const [filters, setFilters] = useState({
    status: "",
    caseCode: "",
    vendor: "",
    account: "",
    name: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const caseCodeToVendorMap = {
    "NRP-111-146-001": "寬聯",
    "PR001": "磐碩營造",
    "PR002": "磐碩營造",
    // 根據需要繼續添加更多對應
  };

  // Fetch API 數據
  const fetchData = () => {
    fetch(`${url}/fleet/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pid: user?.pid }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 403) {
            alert("您沒有權限查看此資料");
          }
          throw new Error(errorData.error || "Unknown error occurred");
        }
        return response.json();
      })
      .then((jsonData) => {
        setData(jsonData);
        setFilteredData(jsonData);
        console.log(jsonData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error.message);
        // 可以在這裡設置錯誤狀態，以在 UI 上顯示錯誤訊息
        setError(error.message);
      });
  };

  useEffect(() => {
    fetchData();
  }, [user?.pid]); // 加入 user?.pid 作為依賴

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
    if (filters.vendor) {
      filtered = filtered.filter((item) =>
        item.vendor.includes(filters.vendor)
      );
    }
    if (filters.account) {
      filtered = filtered.filter((item) =>
        item.account.includes(filters.account)
      );
    }
    if (filters.name) {
      filtered = filtered.filter((item) => item.name.includes(filters.name));
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
    fetch(`${url}/fleet/write`, {
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
            item.emid === updatedItem.emid ? updatedItem : item
          )
        );
        setFilteredData((prevFilteredData) =>
          prevFilteredData.map((item) =>
            item.emid === updatedItem.emid ? updatedItem : item
          )
        );
        closeModal();
        alert("送出成功");
      })
      .catch((error) => console.error("Error updating item:", error));
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      // 全選當前頁的項目
      const allIdsOnPage = paginatedData.map((item) => item.emid);
      setSelectedItems(allIdsOnPage);
    } else {
      // 清空選中的項目
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectAll(false); // 取消全選的狀態
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
      fetch(`${url}/fleet/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emid: selectedItems, operator: user?.username }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete items");
          }
          return response.json();
        })
        .then(() => {
          fetchData();
          setSelectedItems([]); // 清空選取項目
        })
        .catch((error) => console.error("Error deleting items:", error));
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-md shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-4">系統管理 &gt; 公司車隊管理</h2>
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
            name="vendor"
            placeholder="負責廠商"
            value={filters.vendor}
            onChange={handleFilterChange}
            className="p-2 border rounded w-48"
          />
          <input
            type="text"
            name="account"
            placeholder="帳號"
            value={filters.account}
            onChange={handleFilterChange}
            className="p-2 border rounded w-48"
          />
          <input
            type="text"
            name="name"
            placeholder="姓名"
            value={filters.name}
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
              <th className="p-3 border">狀態</th>
              <th className="p-3 border">專案代碼</th>
              <th className="p-3 border">負責廠商</th>
              <th className="p-3 border">帳號</th>
              <th className="p-3 border">姓名</th>
              <th className="p-3 border">角色</th>
              <th className="p-3 border">建立日期</th>
              <th className="p-3 border">維護</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.emid} className="hover:bg-gray-100 border-t">
                <td className="p-3 ">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.emid)}
                    onChange={() => handleSelectItem(item.emid)}
                  />
                </td>
                <td className="p-3 ">{item.status}</td>
                <td className="p-3 ">{item.caseCode}</td>
                <td className="p-3 "> {caseCodeToVendorMap[item.caseCode] || "未知廠商"}</td>
                <td className="p-3 ">{item.account}</td>
                <td className="p-3 ">{item.name}</td>
                <td className="p-3 ">{Array.isArray(item.role) ? item.role.join("、") : item.role || "無角色"}</td>
                <td className="p-3 ">{item.createdDate}</td>
                <td className="p-3 w-24">
                  <button
                    className="p-2 bg-blue-500 text-white rounded shadow flex"
                    onClick={() => openModal(item)}
                  >
                    <img
                      src="/Images/icon-edit.png"
                      alt="calendar"
                      className="h-4 w-4 mr-1 mt-1"
                    />
                    編輯
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <FleetEditModal
          isOpen={isModalOpen}
          onClose={closeModal}
          selectedItem={selectedItem}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default SystemManagementFleet;
