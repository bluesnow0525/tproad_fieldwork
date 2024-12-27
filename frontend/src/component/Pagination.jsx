// src/components/PaginationComponent.jsx
import React from "react";

function PaginationComponent({
  currentPage,
  totalPages,
  setCurrentPage,
  totalItems, // 新增的總資料筆數
}) {
  return (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        上一頁
      </button>
      <div>
        [第 {currentPage} 頁 | 共 {totalPages} 頁]，共 {totalItems} 筆資料，
        目前在第
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const page = Math.max(
              1,
              Math.min(totalPages, Number(e.target.value))
            );
            setCurrentPage(page);
          }}
          className="ml-1 p-1 border rounded w-14 text-center"
        />
        頁
      </div>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        下一頁
      </button>
    </div>
  );
}

export default PaginationComponent;
