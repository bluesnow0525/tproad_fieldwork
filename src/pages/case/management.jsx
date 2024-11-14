import React, { useEffect, useState } from "react";

function CaseManagement() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    observationCase: false,
    inspectionNumber: "",
    district: "",
    reportDateFrom: "",
    reportDateTo: "",
    source: "",
    vehicleNumber: "",
    postedPersonnel: "",
    roadSegment: "",
    damageItem: "",
    damageLevel: "",
    damageCondition: "",
    status: "",
    responsibleFactory: "",
    uploadPipe: "",
  });

  const itemsPerPage = 50;

  useEffect(() => {
    fetch("/data/test.json")
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
        setFilteredData(jsonData);
      });
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const applyFilters = () => {
    let filtered = data;

    if (filters.observationCase) {
      filtered = filtered.filter((item) => item.observationCase);
    }
    if (filters.inspectionNumber) {
      filtered = filtered.filter((item) =>
        item.inspectionNumber.includes(filters.inspectionNumber)
      );
    }
    if (filters.district) {
      filtered = filtered.filter((item) =>
        item.district.includes(filters.district)
      );
    }
    if (filters.reportDateFrom) {
      filtered = filtered.filter(
        (item) => new Date(item.reportDate) >= new Date(filters.reportDateFrom)
      );
    }
    if (filters.reportDateTo) {
      filtered = filtered.filter(
        (item) => new Date(item.reportDate) <= new Date(filters.reportDateTo)
      );
    }
    if (filters.source) {
      filtered = filtered.filter((item) => item.source.includes(filters.source));
    }
    if (filters.vehicleNumber) {
      filtered = filtered.filter((item) =>
        item.vehicleNumber.includes(filters.vehicleNumber)
      );
    }
    if (filters.postedPersonnel) {
      filtered = filtered.filter((item) =>
        item.postedPersonnel.includes(filters.postedPersonnel)
      );
    }
    if (filters.roadSegment) {
      filtered = filtered.filter((item) =>
        item.roadSegment.includes(filters.roadSegment)
      );
    }
    if (filters.damageItem) {
      filtered = filtered.filter((item) =>
        item.damageItem.includes(filters.damageItem)
      );
    }
    if (filters.damageLevel) {
      filtered = filtered.filter((item) =>
        item.damageLevel.includes(filters.damageLevel)
      );
    }
    if (filters.damageCondition) {
      filtered = filtered.filter((item) =>
        item.damageCondition.includes(filters.damageCondition)
      );
    }
    if (filters.status) {
      filtered = filtered.filter((item) => item.status.includes(filters.status));
    }
    if (filters.responsibleFactory) {
      filtered = filtered.filter((item) => item.responsibleFactory.includes(filters.responsibleFactory));
    }
    if (filters.uploadPipe) {
      filtered = filtered.filter((item) =>
        item.uploadPipe.includes(filters.uploadPipe)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to the first page
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-md shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-4">案件管理 / 案件管理</h2>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="observationCase"
              checked={filters.observationCase}
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
            <option value="萬華區">萬華區</option>
            <option value="中正區">中正區</option>
          </select>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              name="reportDateFrom"
              placeholder="查報日期起"
              value={filters.reportDateFrom}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            />
            <span className="text-xl font-bold">~</span>
            <input
              type="date"
              name="reportDateTo"
              placeholder="查報日期迄"
              value={filters.reportDateTo}
              onChange={handleFilterChange}
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
            <option value="全部">全部</option>
            <option value="內部">內部</option>
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
            <option value="混凝土">混凝土</option>
          </select>
          <select
            name="damageLevel"
            value={filters.damageLevel}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">損壞程度</option>
            <option value="輕">輕</option>
            <option value="重">重</option>
          </select>
          <select
            name="damageCondition"
            value={filters.damageCondition}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">損壞情形</option>
            <option value="裂縫">裂縫</option>
            <option value="坑洞">坑洞</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">狀態</option>
            <option value="待審">待審</option>
            <option value="審核通過">審核通過</option>
          </select>
          <select
            name="responsibleFactory"
            value={filters.responsibleFactory}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">廠商</option>
            <option value="磊磊營造">磊磊營造</option>
            <option value="某某公司">某某公司</option>
          </select>
          <select
            name="uploadPipe"
            value={filters.uploadPipe}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">上傳道管</option>
            <option value="全部">全部</option>
            <option value="是">是</option>
            <option value="否">否</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={applyFilters}
            className="p-2 bg-blue-500 text-white rounded shadow"
          >
            查詢
          </button>
          <button className="p-2 bg-green-500 text-white rounded shadow">
            下載excel表
          </button>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 bg-gray-200 rounded"
        >
          上一頁
        </button>
        <div>
          第 {currentPage} 頁 | 共 {totalPages} 頁 | 共 {filteredData.length} 筆
        </div>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 bg-gray-200 rounded"
        >
          下一頁
        </button>
      </div>

      {/* Table Display */}
      <div className="bg-white rounded-md shadow-md p-4 overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">結案</th>
              <th className="p-3 border">觀察案件</th>
              <th className="p-3 border">負責廠商</th>
              <th className="p-3 border">巡查編號</th>
              <th className="p-3 border">行政區</th>
              <th className="p-3 border">巡查路段</th>
              <th className="p-3 border">損壞項目</th>
              <th className="p-3 border">損壞程度</th>
              <th className="p-3 border">報告日期</th>
              <th className="p-3 border">狀態</th>
              <th className="p-3 border">車號</th>
              <th className="p-3 border">登載人員</th>
              <th className="p-3 border">縮圖</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="p-3 border">{item.result}</td>
                <td className="p-3 border">{item.observationCase ? "是" : "否"}</td>
                <td className="p-3 border">{item.responsibleFactory}</td>
                <td className="p-3 border">{item.inspectionNumber}</td>
                <td className="p-3 border">{item.district}</td>
                <td className="p-3 border">{item.roadSegment}</td>
                <td className="p-3 border">{item.damageItem}</td>
                <td className="p-3 border">{item.damageLevel}</td>
                <td className="p-3 border">{item.reportDate}</td>
                <td className="p-3 border">{item.status}</td>
                <td className="p-3 border">{item.vehicleNumber}</td>
                <td className="p-3 border">{item.postedPersonnel}</td>
                <td className="p-3 border">
                  <img src={item.thumbnail} alt="縮圖" className="w-16 h-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CaseManagement;
