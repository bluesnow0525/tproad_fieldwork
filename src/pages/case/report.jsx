import React, { useEffect, useState } from "react";
import PaginationComponent from "../../component/Pagination";
import UploadModal from "../../component/Uploadmodal";

function CaseReport() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    responsibleFactory: "",
    reportDateFrom: "",
    reportDateTo: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [uploadFiles, setUploadFiles] = useState({
    appLog: null,
    appResult: null,
    carLog: null,
    carResult: null,
    motorcycleLog: null,
    motorcycleResult: null,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetch("/data/test_casereport.json")
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
        setFilteredData(jsonData);
      });
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = data;

    if (filters.responsibleFactory) {
      filtered = filtered.filter((item) =>
        item.responsibleFactory.includes(filters.responsibleFactory)
      );
    }
    if (filters.reportDateFrom) {
      const adjustedReportDateFrom = new Date(filters.reportDateFrom);
      adjustedReportDateFrom.setDate(adjustedReportDateFrom.getDate() - 1);
      filtered = filtered.filter(
        (item) => new Date(item.reportDate) > adjustedReportDateFrom
      );
    }
    if (filters.reportDateTo) {
      filtered = filtered.filter(
        (item) => new Date(item.reportDate) <= new Date(filters.reportDateTo)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setUploadFiles((prevFiles) => ({
      ...prevFiles,
      [name]: files[0] || null,
    }));
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleUploadConfirm = (item) => {
    // 處理檔案上傳邏輯
    console.log("Selected Item:", item);
    console.log("Selected Files:", uploadFiles);
    closeModal();
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-md shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-4">案件管理 / 報表作業</h2>
        <div className="flex mb-4 gap-10">
          <select
            name="responsibleFactory"
            value={filters.responsibleFactory}
            onChange={handleFilterChange}
            className="p-2 border rounded w-48"
          >
            <option value="">廠商</option>
            <option value="NRP-111-146-001(寬聯)">NRP-111-146-001(寬聯)</option>
            <option value="PR001(盤碩營造)">PR001(盤碩營造)</option>
            <option value="PR002(盤碩營造)">PR002(盤碩營造)</option>
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
        </div>
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
      </div>

      {/* Pagination Controls */}
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {/* Table Display */}
      <div className="bg-white rounded-md shadow-md p-4 overflow-x-auto mt-4">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">負責廠商</th>
              <th className="p-3 border">報表日期</th>
              <th className="p-3 border">APP原始日誌總表</th>
              <th className="p-3 border">APP原始成果表</th>
              <th className="p-3 border">車巡原始日誌總表</th>
              <th className="p-3 border">車巡原始成果表</th>
              <th className="p-3 border">機車原始日誌總表</th>
              <th className="p-3 border">機車原始成果表</th>
              <th className="p-3 border">修正報表</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="p-3 border border-r-0">
                  {item.responsibleFactory}
                </td>
                <td className="p-3 border border-x-0">{item.reportDate}</td>
                {["appLog", "appResult", "carLog", "carResult", "motorcycleLog", "motorcycleResult"].map((logType) => (
                  <td key={logType} className="p-3 border border-x-0">
                    {item[logType] ? (
                      <>
                        {item[logType].xls && (
                          <a href={item[logType].xls} download>
                            <img
                              src="/Images/ext_excel.png"
                              alt="XLS"
                              className="w-10 h-10 inline-block mr-1"
                            />
                          </a>
                        )}
                        {item[logType].pdf && (
                          <a href={item[logType].pdf} download>
                            <img
                              src="/Images/ext_pdf.png"
                              alt="PDF"
                              className="w-10 h-10 inline-block"
                            />
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">無資料</span>
                    )}
                  </td>
                ))}
                <td className="p-3 border">
                  <button
                    onClick={() => openModal(item)}
                    className="p-2 bg-orange-400 text-white rounded shadow flex"
                  >
                    <img
                      src="/Images/icon-up1.png"
                      alt="up1"
                      className="h-5 w-5 mr-1"
                    />
                    上傳
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleUploadConfirm}
        uploadFiles={uploadFiles}
        handleFileChange={handleFileChange}
        selectedItem={selectedItem}
      />
    </div>
  );
}

export default CaseReport;
