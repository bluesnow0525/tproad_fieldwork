import React, { useState, useEffect } from "react";

function FleetEditModal({ isOpen, onClose, selectedItem, onSave }) {
  const [formData, setFormData] = useState({});

  const roles = ["公司管理員", "內業人員", "修補人員", "維修人員", "巡查人員"];

  // 當 `selectedItem` 改變時，更新 `formData`
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        ...selectedItem,
        createdDate: selectedItem.createdDate
          ? selectedItem.createdDate.replace(/\//g, "-") // 將 "yyyy/MM/dd" 轉為 "yyyy-MM-dd"
          : "",
      });
    } else {
      setFormData({
        status: "啟用", // 預設為啟用
        caseCode: "",
        vendor: "",
        account: "",
        name: "",
        role: [],
        password: "",
        phone: "",
        email: "",
        notes: "",
        passwordErrorCount: 0,
        createdDate: new Date().toISOString().split("T")[0], // 預設為當天
      });
    }
  }, [selectedItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "createdDate" ? value.replace(/\//g, "-") : value, // 日期欄位格式化為 "yyyy-MM-dd"
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => {
      const updatedRoles = prev.role.includes(role)
        ? prev.role.filter((r) => r !== role)
        : [...prev.role, role];
      return { ...prev, role: updatedRoles };
    });
  };

  const handleSave = () => {
    // 驗證必填欄位是否完整
    if (!formData.caseCode || !formData.vendor || !formData.account || !formData.name || formData.role.length === 0) {
      alert("請填寫所有必填欄位，並選擇至少一個角色！");
      return;
    }

    const formattedData = {
      ...formData,
      createdDate: formData.createdDate.replace(/-/g, "/"), // 提交時轉換為 "yyyy/MM/dd"
    };

    onSave(formattedData); // 傳回處理好的 `formData`
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-[600px]">
        <h3 className="text-lg font-semibold mb-4">
          {selectedItem ? "編輯車隊" : "新增車隊"}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col">
            狀態
            <select
              name="status"
              value={formData.status || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            >
              <option value="啟用">啟用</option>
              <option value="停用">停用</option>
            </select>
          </label>
          <label className="flex flex-col">
            專案代碼
            <input
              type="text"
              name="caseCode"
              value={formData.caseCode || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            負責廠商
            <input
              type="text"
              name="vendor"
              value={formData.vendor || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            帳號
            <input
              type="text"
              name="account"
              value={formData.account || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            姓名
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col col-span-2">
            角色
            <div className="grid grid-cols-3 gap-2">
              {roles.map((role) => (
                <label key={role} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.role?.includes(role) || false}
                    onChange={() => handleRoleChange(role)}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </label>
          <label className="flex flex-col">
            密碼
            <input
              type="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            電話
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            電子郵件
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            備註
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            密碼錯誤次數
            <input
              type="number"
              name="passwordErrorCount"
              value={formData.passwordErrorCount || 0}
              onChange={handleChange}
              className="p-2 border rounded"
              min="0"
            />
          </label>
          <label className="flex flex-col">
            建立日期
            <input
              type="date"
              name="createdDate"
              value={formData.createdDate || ""}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </label>
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className="p-2 bg-green-500 text-white rounded"
            onClick={handleSave}
          >
            儲存
          </button>
          <button className="p-2 bg-gray-300 rounded" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

export default FleetEditModal;
