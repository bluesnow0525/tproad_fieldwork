import React, { useEffect, useState } from "react";
import { url } from "../assets/url";
import { useAuth } from "../contexts/AuthContext";

function EditModal({
  isOpen,
  onClose,
  onConfirm,
  defaultValues,
  fieldMapping,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [newImages, setNewImages] = useState({
    photoBefore: null,
    photoAfter: null,
  });
  const [roadSegments, setRoadSegments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoadSegments = roadSegments.filter((segment) =>
    segment.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (formData.標案行政區) {
      fetch(`${url}/caseinfor/road-segments/${formData.標案行政區}`)
        .then((res) => res.json())
        .then((data) => {
          setRoadSegments(data);
        })
        .catch((error) =>
          console.error("Error fetching road segments:", error)
        );
    }
  }, [formData.標案行政區]);

  const selectOptions = {
    狀態: ["待審", "通過"],
    損壞項目: ["AC路面", "人行道及相關設施"],
    損壞程度: ["輕", "中", "重"],
    車道方向: ["順向", "逆向"],
    車道號碼: ["1", "2", "3", "4", "5"],
    標案行政區: [
      "中正區",
      "大同區",
      "中山區",
      "松山區",
      "大安區",
      "萬華區",
      "信義區",
      "士林區",
      "北投區",
      "內湖區",
      "南港區",
      "文山區",
    ],
    觀察案件: ["是", "否"],
    結案: ["是", "否"],
    案件來源: ["APP通報", "車巡", "系統通報", "機車"],
    路段: roadSegments,
    損壞情形:
      formData.損壞項目 === "AC路面"
        ? [
            "坑洞",
            "縱向及橫向裂縫",
            "龜裂",
            "車轍",
            "隆起與凹陷",
            "塊狀裂縫",
            "推擠",
            "補綻及管線回填",
            "冒油",
            "波浪狀鋪面",
            "車道與路肩分離",
            "滑溜裂縫",
            "骨材剝落",
            "其他",
            "人手孔缺失",
            "薄層剝離",
          ]
        : [
            "坑洞",
            "鋪面破損",
            "孔蓋周邊破損",
            "樹穴緣石",
            "溝蓋路邊緣石",
            "其他",
            "鋪面鬆動",
            "樹木竄根",
            "私設斜坡道",
            "側溝蓋破損",
            "雜草",
          ],
  };

  const isSelectField = (fieldName) => {
    return [
      "狀態",
      "損壞項目",
      "車道方向",
      "車道號碼",
      "標案行政區",
      "損壞程度",
      "觀察案件",
      "結案",
      "案件來源",
      "路段",
      "損壞情形",
    ].includes(fieldName);
  };

  const hiddenFields = ["最後修改人", "最後修改日期", "流水號", "上傳市府"];

  useEffect(() => {
    if (isOpen && defaultValues) {
      setFormData({ ...defaultValues });
      setOriginalData({ ...defaultValues });
      setNewImages({
        photoBefore: null,
        photoAfter: null,
      });
    }
  }, [isOpen, defaultValues]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (name === "查報日期" && type === "date") {
      const formattedDate = value.replace(/-/g, "/");
      setFormData((prevData) => ({
        ...prevData,
        [name]: formattedDate,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImages((prev) => ({
          ...prev,
          [fieldName === "施工前遠景照片" ? "photoBefore" : "photoAfter"]: {
            file,
            preview: reader.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    const formDataToSend = new FormData();

    const reversedData = Object.keys(formData).reduce(
      (acc, key) => {
        const originalKey = Object.keys(fieldMapping).find(
          (k) => fieldMapping[k] === key
        );
        if (originalKey) {
          acc[originalKey] = formData[key] === null ? "" : formData[key];
        }
        return acc;
      },
      {
        modifiedBy: user,
      }
    );

    Object.keys(reversedData).forEach((key) => {
      const value = reversedData[key];
      formDataToSend.append(key, value === null ? "" : value);
    });

    if (newImages.photoBefore?.file) {
      formDataToSend.append("photoBefore", newImages.photoBefore.file);
    }
    if (newImages.photoAfter?.file) {
      formDataToSend.append("photoAfter", newImages.photoAfter.file);
    }

    onConfirm(formDataToSend);
    onClose();
  };

  const handleReset = () => {
    setFormData({ ...originalData });
    setNewImages({
      photoBefore: null,
      photoAfter: null,
    });
  };

  if (!isOpen) return null;

  const renderInput = (key) => {
    if (hiddenFields.includes(key)) {
      return null;
    }

    if (key === "路段" && roadSegments.length > 0) {
      const filteredSegments = roadSegments.filter((segment) =>
        segment.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
        <select
          name={key}
          value={formData[key] || ""}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        >
          <option value="">請選擇路段</option>
          {filteredSegments.map((segment) => (
            <option key={segment.value} value={segment.value}>
              {segment.label}
            </option>
          ))}
        </select>
      );
    }

    if (key === "查報日期") {
      return (
        <input
          type="date"
          name={key}
          value={formData[key]?.replace(/\//g, "-") || ""}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        />
      );
    }

    if (isSelectField(key)) {
      return (
        <select
          name={key}
          value={formData[key] || ""}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        >
          <option value="">請選擇{key}</option>
          {selectOptions[key]?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="text"
        name={key}
        value={formData[key] || ""}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
      />
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // 如果點擊的是最外層的遮罩，則關閉 Modal
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl p-8 w-[1200px] max-h-[90vh] overflow-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">編輯資訊</h2>

        <div className="space-y-4">
          {/* 第一行 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                巡查編號
              </label>
              <input
                type="text"
                value={formData.巡查編號 || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                查報日期
              </label>
              <input
                type="text"
                value={formData.查報日期 || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                車牌
              </label>
              <input
                type="text"
                value={formData.車號 || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          {/* 第二行 */}
          <div className="grid grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                標案行政區
              </label>
              {renderInput("標案行政區")}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                狀態
              </label>
              {renderInput("狀態")}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                案件來源
              </label>
              {renderInput("案件來源")}
            </div>
          </div>

          {/* 第二行：路段選擇 */}
          <div className="grid grid-cols-1 gap-6">
            <div className="flex space-x-4">
              <div className="w-1/6 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  搜尋路段
                </label>
                <input
                  type="text"
                  placeholder="搜尋路段..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-1/4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  路段
                </label>
                <select
                  name="路段"
                  value={formData.路段 || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                >
                  <option value="">請選擇路段</option>
                  {filteredRoadSegments.map((segment) => (
                    <option key={segment.value} value={segment.value}>
                      {segment.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  地址
                </label>
                {renderInput("巡查路段")}
              </div>
            </div>
          </div>

          {/* 第三行 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                損壞項目
              </label>
              {renderInput("損壞項目")}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                損壞情形
              </label>
              {renderInput("損壞情形")}
            </div>
          </div>

          {/* 第四行 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                車道方向
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="車道方向"
                    value="順向"
                    checked={formData.車道方向 === "順向"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label>順向</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="車道方向"
                    value="逆向"
                    checked={formData.車道方向 === "逆向"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label>逆向</label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                第幾車道
              </label>
              {renderInput("車道號碼")}
            </div>
          </div>

          {/* 第五行 */}
          <div className="grid grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                損壞程度
              </label>
              {renderInput("損壞程度")}
            </div>
            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                尺寸（長 / 寬 / 面積）
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                  name="長"
                  value={formData.長 || ""}
                  onChange={handleInputChange}
                  placeholder="長"
                />
                <span>/</span>
                <input
                  type="text"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                  name="寬"
                  value={formData.寬 || ""}
                  onChange={handleInputChange}
                  placeholder="寬"
                />
                <span>/</span>
                <input
                  type="text"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                  name="面積"
                  value={formData.面積 || ""}
                  onChange={handleInputChange}
                  placeholder="面積"
                />
              </div>
            </div>
          </div>

          {/* 第六行：經緯度 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                經度
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.經度 || ""}
                onChange={handleInputChange}
                name="經度"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                緯度
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.緯度 || ""}
                onChange={handleInputChange}
                name="緯度"
              />
            </div>
          </div>

          {/* 圖片區塊 */}
          <div className="grid grid-cols-2 gap-8 mt-4">
            {["施工前遠景照片", "施工後遠景照片"].map((key) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {key}
                </label>
                <div className="space-y-4">
                  <div className="h-48 w-full border rounded-lg overflow-hidden bg-gray-50">
                    {newImages[
                      key === "施工前遠景照片" ? "photoBefore" : "photoAfter"
                    ]?.preview ||
                    (formData[key] && `${url}/files/img/${formData[key]}`) ? (
                      <img
                        src={
                          newImages[
                            key === "施工前遠景照片"
                              ? "photoBefore"
                              : "photoAfter"
                          ]?.preview || `${url}/files/img/${formData[key]}`
                        }
                        alt={key}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        無圖片
                      </div>
                    )}
                  </div>
                  <div className="flex justify-start">
                    <label className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, key)}
                        className="hidden"
                      />
                      {formData[key] ? "更換圖片" : "上傳圖片"}
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 按鈕區 */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            重新輸入
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
