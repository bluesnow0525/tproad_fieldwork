import React, { useEffect, useState } from "react";
import PaginationComponent from "../../component/Pagination";
import EditModal from "../../component/Case_Editmodal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { url } from "../../assets/url";
import { useAuth } from "../../contexts/AuthContext";

function CaseManagement() {
  const { user } = useAuth();
  console.log(user);

  const today = new Date().toISOString().split("T")[0]; // 取得今天的日期 (YYYY-MM-DD)
  // 計算一個月前的日期
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const minDate = oneMonthAgo.toISOString().split("T")[0];

  // const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "", // Column to sort by
    direction: "asc", // Sorting direction: "asc" or "desc"
  });
  const [loading, setLoading] = useState(false);

  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    caid: "",
    result: "",
    thumbnail: "",
    notification: false,
    inspectionNumber: "",
    district: "",
    reportDateFrom: today,
    reportDateTo: today,
    source: "",
    vehicleNumber: "",
    postedPersonnel: "",
    roadSegment: "",
    damageItem: "",
    damageLevel: "",
    damageCondition: "",
    status: "",
    responsibleFactory: "",
    laneDirection: "", // 新增車道方向
    laneNumber: "", // 新增車道號碼
    // uploadPipe: "",
  });
  const [selectedItems, setSelectedItems] = useState([]); // 存儲被選中的項目 ID
  const [selectAll, setSelectAll] = useState(false); // 控制全選框

  const itemsPerPage = 50;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // 定義日期範圍
    const requestData = filters;
    setLoading(true);

    fetch(`${url}/caseinfor/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then(async (response) => {
        if (!response.ok) {
          // 如果 response 非 OK，嘗試解析錯誤訊息
          const errorData = await response.json();
          throw new Error(errorData.error || "Unknown error occurred");
        }
        return response.json();
      })
      .then((jsonData) => {
        setFilteredData(jsonData);
        console.log(jsonData);
      })
      .catch((error) => {
        console.error("Error fetching caseinfor data:", error.message);
        // 可以在這裡設置錯誤狀態以便顯示在 UI 上
        setError(error.message);
      })
      .finally(() => {
        setLoading(false); // 完成 Loading
      });
  }, []);

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      // 全選當前頁的項目
      const allIdsOnPage = paginatedData.map((item) => item.caid);
      setSelectedItems(allIdsOnPage);
      console.log("選取的項目：", allIdsOnPage); // 在控制台顯示選取的項目
    } else {
      // 清空選中的項目
      setSelectedItems([]);
      console.log("選取的項目：", []); // 清空選擇
    }
  };

  const handleSelectItem = (id) => {
    setSelectAll(false); // 取消全選的狀態
    setSelectedItems((prevSelected) => {
      const newSelected = prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id];
      console.log("選取的項目：", newSelected); // 在控制台顯示選取的項目
      return newSelected;
    });
  };

  const handleConfirmReview = () => {
    if (!selectedItems.length) {
      alert("請先勾選項目！");
      return;
    }

    const confirmAction = window.confirm("確認審查通過？");
    if (confirmAction) {
      const updatedItems = selectedItems.map((caid) => ({
        caid,
        result: "是",
      }));

      // 發送更新請求至後端
      fetch(`${url}/caseinfor/write`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedItems),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to update data");
          return response.json();
        })
        .then((result) => {
          console.log("Review successful:", result);

          // 更新本地數據
          setFilteredData((prevFilteredData) =>
            prevFilteredData.map((item) =>
              selectedItems.includes(item.caid)
                ? { ...item, result: "是" }
                : item
            )
          );

          setSelectedItems([]); // 清空選取項目
        })
        .catch((error) => console.error("Error updating data:", error));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFilters((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }
    // 計算新的日期範圍
    if (name === "reportDateFrom") {
      const fromDate = new Date(value);
      const toDate = new Date(filters.reportDateTo);

      // 確保 "reportDateTo" 不超過 1 個月
      const maxAllowedToDate = new Date(fromDate);
      maxAllowedToDate.setMonth(maxAllowedToDate.getMonth() + 1);

      if (toDate > maxAllowedToDate) {
        alert("查報日期範圍不能超過一個月！");
        setFilters({
          ...filters,
          [name]: value,
          reportDateTo: maxAllowedToDate.toISOString().split("T")[0],
        });
      } else {
        setFilters({
          ...filters,
          [name]: value,
        });
      }
    } else if (name === "reportDateTo") {
      const toDate = new Date(value);
      const fromDate = new Date(filters.reportDateFrom);

      // 確保 "reportDateFrom" 不小於 1 個月
      const minAllowedFromDate = new Date(toDate);
      minAllowedFromDate.setMonth(minAllowedFromDate.getMonth() - 1);

      if (fromDate < minAllowedFromDate) {
        alert("查報日期範圍不能超過一個月！");
        setFilters({
          ...filters,
          [name]: value,
          reportDateFrom: minAllowedFromDate.toISOString().split("T")[0],
        });
      } else {
        setFilters({
          ...filters,
          [name]: value,
        });
      }
    } else {
      setFilters({
        ...filters,
        [name]: value,
      });
    }
  };

  const applyFilters = () => {
    const requestData = filters;
    console.log(requestData);
    setLoading(true);

    fetch(`${url}/caseinfor/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((jsonData) => {
        // setData(jsonData);
        setFilteredData(jsonData);
        console.log(jsonData);
      })
      .catch((error) => {
        console.error("Error fetching caseinfor data:", error);
      })
      .finally(() => {
        setLoading(false); // 完成 Loading
      });
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fieldMapping = {
    caid: "流水號",
    inspectionNumber: "巡查編號",
    result: "結案",
    district: "標案行政區",
    roadSegment: "巡查路段",
    caRoad: "路段",
    damageItem: "損壞項目",
    damageCondition: "損壞情形",
    damageLevel: "損壞程度",
    notification: "觀察案件",
    postedPersonnel: "登載人員",
    vehicleNumber: "車號",
    status: "狀態",
    reportDate: "查報日期",
    responsibleFactory: "廠商",
    uploadToGovernment: "上傳市府", // 新增字段
    source: "案件來源", // 新增字段
    laneDirection: "車道方向", // 新增
    laneNumber: "車道號碼", // 新增
    longitude: "經度", // 新增字段
    latitude: "緯度", // 新增字段
    area: "面積", // 新增字段
    length: "長",
    width: "寬",
    modifiedBy: "最後修改人", // 新增字段
    modifiedDate: "最後修改日期", // 新增字段
    photoBefore: "施工前遠景照片", // 新增字段
    photoAfter: "施工後遠景照片", // 新增字段
  };

  const openModal = (item) => {
    const translatedItem = Object.keys(item).reduce((acc, key) => {
      const translatedKey = fieldMapping[key] || key;
      acc[translatedKey] = item[key];
      return acc;
    }, {});
    setSelectedItem(translatedItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleEditConfirm = async (formData) => {
    try {
      const response = await fetch(`${url}/caseinfor/write`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update data");
      const result = await response.json();

      console.log("Update successful:", result);
      alert(result.message);

      // 更新本地數據
      const updatedData = await fetch(`${url}/caseinfor/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      }).then((res) => res.json());

      setFilteredData(updatedData);
    } catch (error) {
      console.error("Error updating data:", error);
      alert("更新失敗，請稍後再試");
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        流水號: item.caid,
        巡查編號: item.inspectionNumber,
        結案: item.result,
        結案原因: "", // 若有其他字段需補充此內容，請提供
        上傳市府: item.uploadToGovernment, // 已對應後端字段
        案件來源: item.source, // 已對應後端字段
        專案代碼: item.responsibleFactory,
        查報日期: item.reportDate,
        授權之token: "", // 暫無對應後端字段
        觀察案件: item.notification,
        標案行政區: item.district,
        巡查路段: item.caRoad,
        地址: item.roadSegment, // 暫無對應後端字段
        車道方向: item.laneDirection,
        第幾車道: item.laneNumber, // 暫無對應後端字段
        損壞項目: item.damageItem,
        損壞情形: item.damageCondition,
        損壞程度: item.damageLevel,
        損壞說明: "", // 暫無對應後端字段
        經度: item.longitude || "", // 若無值，則返回空字串
        緯度: item.latitude || "", // 若無值，則返回空字串
        建立日期: item.modifiedDate || "", // 已對應後端字段
        登載人員帳號: "", // 若登載人員帳號需要分開，需補充對應邏輯
        登載人員: item.postedPersonnel,
        紀錄來源: "", // 暫無對應後端字段
        車號: item.vehicleNumber,
        狀態: item.status,
        長: item.length || "", // 從 `area` 字段中提取長度
        寬: item.width || "", // 從 `area` 字段中提取寬度
        面積: item.area || "", // 已對應後端字段
        門牌遠景: "", // 暫無對應後端字段
        查報日期存到時間: item.modifiedDate || "", // 已對應後端字段
        施工前遠景照片: item.photoBefore, // 已對應後端字段
        施工後遠景照片: item.photoAfter, // 已對應後端字段
      }))
    );

    // 自動調整欄位寬度
    const colWidths = Object.keys(worksheet).reduce((acc, key) => {
      if (key[0] === "!") return acc;
      const colIndex = key.replace(/[0-9]/g, ""); // 提取列標
      const value = worksheet[key].v || "";
      acc[colIndex] = Math.max(acc[colIndex] || 10, value.toString().length);
      return acc;
    }, {});

    worksheet["!cols"] = Object.values(colWidths).map((width) => ({
      wch: width + 5,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "案件管理");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(dataBlob, "案件管理.xlsx");
  };

  const applySorting = (key) => {
    setSortConfig((prevSortConfig) => {
      const newDirection =
        prevSortConfig.key === key && prevSortConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key, direction: newDirection };
    });

    // Perform sorting
    const sortedData = [...filteredData].sort((a, b) => {
      if (!a[key] || !b[key]) return 0; // Handle undefined or null values
      if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredData(sortedData);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-md shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-4">案件管理 / 案件管理</h2>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="notification"
              checked={filters.notification}
              onChange={handleFilterChange}
              className="h-6 w-6"
            />
            <span>觀察案件</span>
          </label>
          <input
            type="text"
            name="inspectionNumber"
            placeholder="巡查編號"
            value={filters.inspectionNumber}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
          <select
            name="district"
            value={filters.district}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">行政區</option>
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
          <div className="flex items-center space-x-2">
            <img
              src="/Images/show-calendar.gif"
              alt="calendar"
              className="h-8 w-8"
            />
            <input
              type="date"
              name="reportDateFrom"
              placeholder="查報日期起"
              value={filters.reportDateFrom}
              onChange={handleFilterChange}
              max={filters.reportDateTo || today} // 動態限制最大值為 "reportDateTo" 或今天
              className="p-2 border rounded"
            />
            <span className="text-xl font-bold">~</span>
            <input
              type="date"
              name="reportDateTo"
              placeholder="查報日期迄"
              value={filters.reportDateTo}
              onChange={handleFilterChange}
              min={filters.reportDateFrom || minDate} // 動態限制最小值為 "reportDateFrom" 或 minDate
              className="p-2 border rounded"
            />
          </div>
          <select
            name="source"
            value={filters.source}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">來源</option>
            <option value="APP通報">APP通報</option>
            <option value="車巡">車巡</option>
            <option value="系統新增">系統新增</option>
            <option value="機車">機車</option>
          </select>
          <input
            type="text"
            name="vehicleNumber"
            placeholder="車號"
            value={filters.vehicleNumber}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="postedPersonnel"
            placeholder="登載人員"
            value={filters.postedPersonnel}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="roadSegment"
            placeholder="路段"
            value={filters.roadSegment}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
          <select
            name="damageItem"
            value={filters.damageItem}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">損壞項目</option>
            <option value="AC路面">AC路面</option>
            <option value="人行道及相關設施">人行道及相關設施</option>
          </select>
          <select
            name="damageLevel"
            value={filters.damageLevel}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">損壞程度</option>
            <option value="輕">輕</option>
            <option value="中">中</option>
            <option value="重">重</option>
          </select>
          <select
            name="damageCondition"
            value={filters.damageCondition}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">損壞情形</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">狀態</option>
            <option value="待審">待審</option>
            <option value="通過">通過</option>
          </select>
          <select
            name="responsibleFactory"
            value={filters.responsibleFactory}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">廠商</option>
            <option value="NRP-111-146-001_寬聯">NRP-111-146-001(寬聯)</option>
            <option value="PR001_盤碩營造">PR001(盤碩營造)</option>
            <option value="PR002_盤碩營造">PR002(盤碩營造)</option>
          </select>
          {/* <select
            name="uploadPipe"
            value={filters.uploadPipe}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">上傳道管</option>
            <option value="失敗">失敗</option>
            <option value="是">是</option>
            <option value="否">否</option>
          </select> */}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={applyFilters}
            className="p-2 bg-blue-500 text-white rounded shadow w-20 flex"
          >
            <img
              src="/Images/icon-search.png"
              alt="calendar"
              className="h-5 w-5 mr-1"
            />
            查詢
          </button>
          <button
            onClick={exportToExcel}
            className="p-2 bg-green-500 text-white rounded shadow"
          >
            下載excel表
          </button>
        </div>
      </div>

      {/* Pagination Controls */}
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalItems={filteredData.length} // 傳入總資料筆數
      />

      <button
        onClick={handleConfirmReview}
        className="p-2 bg-blue-500 text-white rounded shadow w-20 mt-4"
      >
        審查通過
      </button>

      {/* Table Display */}
      <div className="bg-white rounded-md shadow-md p-4 overflow-x-auto mt-2">
        <table className="w-full text-center border-collapse">
          <thead className="whitespace-nowrap">
            <tr className="bg-gray-200">
              <th className="p-3 border">
                全選
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="ml-2"
                />
              </th>
              <th className="p-3 border">結案</th>
              <th className="p-3 border">觀察案件</th>
              <th className="p-3 border">
                報告日期
                <button
                  onClick={() => applySorting("reportDate")}
                  className="ml-2 text-sm text-blue-500"
                >
                  <img
                    src="/Images/arrow_D.png"
                    alt="arrow"
                    className="h-3 w-3 mr-1"
                  />
                </button>
              </th>
              <th className="p-3 border">
                負責廠商
                <button
                  onClick={() => applySorting("responsibleFactory")}
                  className="ml-2 text-sm text-blue-500"
                >
                  <img
                    src="/Images/arrow_D.png"
                    alt="arrow"
                    className="h-3 w-3 mr-1"
                  />
                </button>
              </th>
              <th className="p-3 border">
                巡查編號
                <button
                  onClick={() => applySorting("inspectionNumber")}
                  className="ml-2 text-sm text-blue-500"
                >
                  <img
                    src="/Images/arrow_D.png"
                    alt="arrow"
                    className="h-3 w-3 mr-1"
                  />
                </button>
              </th>
              <th className="p-3 border">
                行政區
                <button
                  onClick={() => applySorting("district")}
                  className="ml-2 text-sm text-blue-500"
                >
                  <img
                    src="/Images/arrow_D.png"
                    alt="arrow"
                    className="h-3 w-3 mr-1"
                  />
                </button>
              </th>
              <th className="p-3 border">
                巡查路段
                <button
                  onClick={() => applySorting("roadSegment")}
                  className="ml-2 text-sm text-blue-500"
                >
                  <img
                    src="/Images/arrow_D.png"
                    alt="arrow"
                    className="h-3 w-3 mr-1"
                  />
                </button>
              </th>
              <th className="p-3 border">車道方向</th>
              <th className="p-3 border">損壞項目</th>
              <th className="p-3 border">損壞程度</th>
              <th className="p-3 border">損壞情形</th>
              <th className="p-3 border">
                車號
                <button
                  onClick={() => applySorting("vehicleNumber")}
                  className="ml-2 text-sm text-blue-500"
                >
                  <img
                    src="/Images/arrow_D.png"
                    alt="arrow"
                    className="h-3 w-3 mr-1"
                  />
                </button>
              </th>
              <th className="p-3 border">登載人員</th>
              <th className="p-3 border">縮圖</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr
                key={item.caid}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => openModal(item)}
              >
                <td
                  className="p-3 border"
                  onClick={(event) => event.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.caid)}
                    onChange={(event) => {
                      event.stopPropagation();
                      handleSelectItem(item.caid);
                    }}
                  />
                </td>
                <td className="p-3 border border-x-0">{item.result || ""}</td>
                <td className="p-3 border border-x-0">
                  {item.notification === "是" ? "是" : "否"}
                </td>
                <td className="p-3 border border-x-0">
                  {item.reportDate || ""}
                </td>
                <td className="p-3 border border-x-0">
                  {item.responsibleFactory || ""}
                </td>
                <td className="p-3 border border-x-0">
                  {item.inspectionNumber || ""}
                </td>
                <td className="p-3 border border-x-0">{item.district || ""}</td>
                <td className="p-3 border border-x-0">
                  {item.roadSegment || ""}
                </td>
                <td className="p-3 border border-x-0">
                  {item.laneDirection || ""} {item.laneNumber || ""}
                </td>
                <td className="p-3 border border-x-0">
                  {item.damageItem || ""}
                </td>
                <td className="p-3 border border-x-0">
                  {item.damageLevel || ""}
                </td>
                <td className="p-3 border border-x-0">
                  {item.damageCondition || ""}
                </td>
                <td className="p-3 border border-x-0">
                  {item.vehicleNumber || ""}
                </td>
                <td className="p-3 border border-x-0">
                  {item.postedPersonnel || ""}
                </td>
                <td className="p-3 border relative">
                  {item.photoBefore ? (
                    <div className="relative group">
                      <img
                        src={`${url}/files/img/${item.photoBefore}`}
                        alt="縮圖"
                        className="w-32 h-20 cursor-pointer"
                      />

                      {/* 懸停時顯示的大圖容器 */}
                      <div className="hidden group-hover:flex fixed inset-0 z-50 items-center justify-center pointer-events-none">
                        {/* 圖片容器 */}
                        <div className="flex gap-8 z-10 bg-white p-6 rounded-xl shadow-2xl max-w-[80vw] pointer-events-auto border border-gray-500">
                          <div className="space-y-3">
                            <p className="text-lg font-medium text-gray-800 text-center">
                              施工前
                            </p>
                            <img
                              src={`${url}/files/img/${item.photoBefore}`}
                              alt="施工前大圖"
                              className="w-[500px] h-auto object-contain"
                            />
                          </div>
                          <div className="space-y-3">
                            <p className="text-lg font-medium text-gray-800 text-center">
                              施工後
                            </p>
                            {item.photoAfter ? (
                              <img
                                src={`${url}/files/img/${item.photoAfter}`}
                                alt="施工後大圖"
                                className="w-[500px] h-auto object-contain"
                              />
                            ) : (
                              <div className="w-[500px] h-[400px] flex items-center justify-center bg-gray-100 text-gray-400">
                                無施工後照片
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">無縮圖</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleEditConfirm}
        defaultValues={selectedItem || {}} // 預設值為選中的行數據
        fieldMapping={fieldMapping}
      />
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default CaseManagement;
