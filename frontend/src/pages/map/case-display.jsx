import React, { useState, useEffect, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer, TextLayer } from "@deck.gl/layers";
import { MapView } from "@deck.gl/core";
import { url } from "../../assets/url";
import { useAuth } from "../../contexts/AuthContext";
import Supercluster from "supercluster";

const INITIAL_VIEW_STATE = {
  longitude: 121.52184814,
  latitude: 25.03895707,
  zoom: 15,
  pitch: 0,
  bearing: 0,
};

// Initialize supercluster
const index = new Supercluster({
  radius: 40,
  maxZoom: 16,
});

const CaseDisplay = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cases, setCases] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [visibleConditions, setVisibleConditions] = useState({});
  const [allSelected, setAllSelected] = useState(true);
  const [filterParams, setFilterParams] = useState({
    selectedProject: "",
    selectedVehicles: [],
    reportDateFrom: today,
    reportDateTo: today,
    districts: {},
    sources: {
      selected: "", // 改為單一字串
    },
    damageTypes: {
      AC路面: false,
      人行道及相關設施: false,
    },
  });
  const [projects, setProjects] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".district-dropdown")) {
        setIsDistrictDropdownOpen(false);
      }
      if (!event.target.closest(".vehicle-dropdown")) {
        setIsVehicleDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDistrictDropdownOpen, isVehicleDropdownOpen]);

  // Update clusters when cases or visibility changes
  useEffect(() => {
    fetch(`${url}/roadcase/projects`)
      .then((res) => res.json())
      .then((response) => {
        if (response.status === "success") {
          setProjects(response.data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    updateClusters();
  }, [cases, visibleConditions, viewState]);

  const updateClusters = () => {
    if (!cases.length) {
      setClusters([]); // 清空聚合點
      return;
    }

    // Prepare points for clustering
    const visiblePoints = cases.filter(
      (c) => visibleConditions[c.damageCondition] !== false
    );

    if (visiblePoints.length === 0) {
      setClusters([]); // 當沒有可見的點時也清空
      return;
    }

    const points = visiblePoints.map((point) => ({
      type: "Feature",
      properties: { ...point },
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude],
      },
    }));

    // Load points into supercluster
    index.load(points);

    // Get clusters based on current view
    const bounds = [
      viewState.longitude - 0.1,
      viewState.latitude - 0.1,
      viewState.longitude + 0.1,
      viewState.latitude + 0.1,
    ];

    const clusters = index.getClusters(bounds, Math.floor(viewState.zoom));
    setClusters(clusters);
  };

  const handleFilterChange = (filters) => {
    const requestData = {
      ...filters,
      pid: user?.pid,
    };
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
          const errorData = await response.json();
          if (response.status === 403) {
            alert("您沒有權限查看此資料");
          }
          throw new Error(errorData.error || "Unknown error occurred");
        }
        return response.json();
      })
      .then((jsonData) => {
        setCases(jsonData);
        const conditions = {};
        jsonData.forEach((item) => {
          conditions[item.damageCondition] = true;
        });
        setVisibleConditions(conditions);
        setAllSelected(true);
      })
      .catch((error) => {
        console.error("Error fetching caseinfor data:", error.message);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearch = () => {
    const filters = {
      pid: user?.pid,
      reportDateFrom: filterParams.reportDateFrom,
      reportDateTo: filterParams.reportDateTo,
      district: Object.entries(filterParams.districts)
        .filter(([_, checked]) => checked)
        .map(([district]) => district)
        .join(","),
      source: filterParams.sources.selected, // 直接使用選中的來源
      damageItem: Object.entries(filterParams.damageTypes)
        .filter(([_, checked]) => checked)
        .map(([type]) => type)
        .join(","),
      responsibleFactory: filterParams.selectedProject,
      vehicleNumber: filterParams.selectedVehicles.join(","),
    };

    handleFilterChange(filters);
  };

  // Layers definition
  const layers = useMemo(() => {
    const tileLayer = new TileLayer({
      data: "https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}",
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: (props) => {
        const {
          bbox: { west, south, east, north },
        } = props.tile;

        return new BitmapLayer(props, {
          data: null,
          image: props.data,
          bounds: [west, south, east, north],
        });
      },
    });

    const iconLayer = new IconLayer({
      id: "clusters",
      data: clusters,
      pickable: true,
      getPosition: (d) => d.geometry.coordinates,
      getIcon: (d) => {
        if (d.properties.cluster) {
          // 為聚合點生成SVG圓圈
          const count = d.properties.point_count;
          const size = Math.min(count, 120); // 限制最大大小
          const scale = Math.max(20, Math.min(40, 20 + Math.log2(count) * 5)); // 根據點數動態調整大小

          // 根據數量決定顏色
          let fillColor;
          if (count < 100) {
            fillColor = "rgba(123, 216, 230, 0.9)"; // 淺藍色
          } else if (count < 500) {
            fillColor = "rgba(255, 255, 0, 0.9)"; // 黃色
          } else if (count < 1000) {
            fillColor = "rgba(255, 125, 0, 0.9)"; // 橘色
          } else {
            fillColor = "rgba(255, 0, 0, 0.8)"; // 紅色
          }

          // 生成SVG圓圈
          const svg = `
            <svg width="${scale * 2}" height="${scale * 2}" viewBox="0 0 ${scale * 2} ${scale * 2}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${scale}" cy="${scale}" r="${scale - 2}" fill="${fillColor}" stroke="white" stroke-width="2"/>
            </svg>
          `;

          return {
            url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
            width: scale * 2,
            height: scale * 2,
            anchorY: scale,
          };
        }
        return {
          url: `/Images/${d.properties.damageCondition_code}-g.png`,
          width: 48,
          height: 48,
          anchorX: 24,
          anchorY: 24,
        };
      },
      getSize: (d) => {
        if (d.properties.cluster) {
          const count = d.properties.point_count;
          return Math.max(40, Math.min(60, 40 + Math.log2(count) * 5)); // 動態大小
        }
        return 30;
      },
      onClick: (info) => {
        if (info.object?.properties.cluster_id) {
          const expansionZoom = Math.min(
            index.getClusterExpansionZoom(info.object.properties.cluster_id),
            20
          );

          setViewState((prev) => ({
            ...prev,
            longitude: info.object.geometry.coordinates[0],
            latitude: info.object.geometry.coordinates[1],
            zoom: expansionZoom,
            transitionDuration: 500,
          }));
        } else if (info.object) {
          setSelectedCase(info.object.properties);
        }
      },
    });

    const textLayer = new TextLayer({
      id: "cluster-counts",
      data: clusters.filter((d) => d.properties.cluster),
      getPosition: (d) => d.geometry.coordinates,
      getText: (d) => d.properties.point_count.toString(),
      getSize: 14,
      getColor: [0, 0, 0], // 黑色文字
      getFontSettings: () => ({
        fontSize: 14,
        fontWeight: "bold",
      }),
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
    });

    return [tileLayer, iconLayer, textLayer];
  }, [clusters]);

  const handleProjectChange = async (projectCode) => {
    setFilterParams((prev) => ({
      ...prev,
      selectedProject: projectCode,
      selectedVehicles: [],
      districts: {},
    }));

    if (!projectCode) return;

    try {
      const response = await fetch(`${url}/roadcase/districts/${projectCode}`);
      const result = await response.json();

      if (result.status === "success") {
        const newDistricts = {};
        result.data.forEach((district) => {
          newDistricts[district] = false;
        });

        setFilterParams((prev) => ({
          ...prev,
          districts: newDistricts,
        }));
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  // 當選擇來源時的處理函數
  const handleSourceChange = async (source) => {
    // 如果點擊已選中的來源，則取消選擇
    const newSource = filterParams.sources.selected === source ? "" : source;

    setFilterParams((prev) => ({
      ...prev,
      sources: {
        selected: newSource,
      },
      // 當切換來源時清空已選車輛
      selectedVehicles: [],
    }));

    // 只在選擇車巡或機車時獲取車輛列表
    if (
      filterParams.selectedProject &&
      (source === "車巡" || source === "機車")
    ) {
      try {
        const vehicleType = source === "車巡" ? "car" : "motorcycle";
        const response = await fetch(
          `${url}/roadcase/vehicles/${filterParams.selectedProject}?type=${vehicleType}`
        );
        const result = await response.json();

        if (result.status === "success") {
          setAvailableVehicles(result.data);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    } else {
      // 清空可用車輛列表
      setAvailableVehicles([]);
    }
  };

  // 在其他 handle 函數附近添加
  const handleDamageTypeChange = (type) => {
    setFilterParams((prev) => ({
      ...prev,
      damageTypes: {
        ...prev.damageTypes,
        [type]: !prev.damageTypes[type],
      },
    }));
  };

  const handleToggleAllConditions = () => {
    const newValue = !allSelected;
    setAllSelected(newValue);
    const newVisibleConditions = {};
    Object.keys(visibleConditions).forEach((key) => {
      newVisibleConditions[key] = newValue;
    });
    setVisibleConditions(newVisibleConditions);
  };

  const handleToggleCondition = (condition) => {
    setVisibleConditions((prev) => {
      const newState = {
        ...prev,
        [condition]: !prev[condition],
      };
      const areAllSelected = Object.values(newState).every((v) => v === true);
      setAllSelected(areAllSelected);
      return newState;
    });
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        <DeckGL
          layers={layers}
          viewState={viewState}
          onViewStateChange={({ viewState: newViewState }) => {
            setViewState(newViewState);
          }}
          controller={true}
          views={[new MapView({ repeat: true })]}
        >
          {/* 比例尺 */}
          <div className="absolute bottom-0 left-0 bg-white px-2 py-1 text-xs z-10 border-t border-r border-gray-300">
            ©TGOS © 內政部
          </div>

          {/* 統計資訊面板 */}
          <div className="absolute top-4 left-4 bg-white p-4 rounded shadow-lg z-10 w-64">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">案件統計</h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleAllConditions}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-600">全選</span>
              </label>
            </div>
            <p className="text-gray-600 mb-2">總案件數: {cases.length} 件</p>

            <div className="space-y-2">
              {Object.entries(
                cases.reduce((acc, curr) => {
                  const key = curr.damageCondition;
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {})
              ).map(([condition, count]) => {
                const code = cases.find(
                  (c) => c.damageCondition === condition
                )?.damageCondition_code;
                return (
                  <div key={condition} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={visibleConditions[condition] !== false}
                      onChange={() => handleToggleCondition(condition)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <img
                      src={`/Images/${code}.png`}
                      alt={condition}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-sm text-gray-600">{condition}</span>
                    <span className="text-sm font-medium">{count} 件</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Loading 指示器 */}
          {loading && (
            <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            </div>
          )}

          {/* 錯誤提示 */}
          {error && (
            <div className="absolute top-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded shadow">
              {error}
            </div>
          )}

          {/* 彈出視窗 */}
          {selectedCase && (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                         bg-white p-4 rounded-lg shadow-lg z-20 w-[800px]"
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedCase(null)}
              >
                ✕
              </button>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">
                  案件編號: {selectedCase.inspectionNumber}
                </h3>
                <div className="flex w-full">
                  <div className="w-1/3">
                    <p className="text-gray-700">
                      日期: {selectedCase.reportDate}
                    </p>
                    <p className="text-gray-700">
                      地址: {selectedCase.district}
                      {selectedCase.roadSegment}
                    </p>
                    <p className="text-red-600 font-semibold">
                      破壞: {selectedCase.damageCondition}
                    </p>
                  </div>
                  <div className="w-1/3">
                    <p className="text-gray-700">尺寸資訊:</p>
                    <ul className="list-none pl-4">
                      <li>長度: {selectedCase.length}</li>
                      <li>寬度: {selectedCase.width}</li>
                      <li>面積: {selectedCase.area}</li>
                    </ul>
                  </div>
                  <div className="w-1/3">
                    <p className="text-gray-700">位置:</p>
                    <ul className="list-none pl-4">
                      <li>經度: {selectedCase.longitude}</li>
                      <li>緯度: {selectedCase.latitude}</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 flex">
                  {selectedCase.photoBefore && (
                    <img
                      src={`${url}/files/img/${selectedCase.reportDate?.replace(/\//g, "")}/${selectedCase.photoBefore}`}
                      alt="Before"
                      className="w-full h-48 object-contain"
                    />
                  )}
                  {selectedCase.photoAfter && (
                    <img
                      src={`${url}/files/img/${selectedCase.reportDate?.replace(/\//g, "")}/${selectedCase.photoAfter}`}
                      alt="After"
                      className="w-full h-48 object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </DeckGL>
      </div>

      {/* 右側篩選器 */}
      <div className="w-64 p-4 bg-white shadow-lg">
        <div className="space-y-4">
          {/* 專案選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              專案選擇
            </label>
            <select
              value={filterParams.selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">請選擇專案</option>
              {projects.map((project) => (
                <option key={project.value} value={project.value}>
                  {project.label}
                </option>
              ))}
            </select>
          </div>

          {/* 日期區間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日期區間
            </label>
            <input
              type="date"
              value={filterParams.reportDateFrom}
              onChange={(e) =>
                setFilterParams((prev) => ({
                  ...prev,
                  reportDateFrom: e.target.value,
                }))
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="date"
              value={filterParams.reportDateTo}
              onChange={(e) =>
                setFilterParams((prev) => ({
                  ...prev,
                  reportDateTo: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
          </div>

          {/* 行政區下拉選單 */}
          {Object.keys(filterParams.districts).length > 0 && (
            <div className="district-dropdown">
              <h3 className="text-sm font-medium text-gray-700 mb-2">行政區</h3>
              <div className="relative">
                <div
                  className="w-full p-2 border rounded bg-white cursor-pointer flex justify-between items-center"
                  onClick={() =>
                    setIsDistrictDropdownOpen(!isDistrictDropdownOpen)
                  }
                >
                  <div className="flex-1 overflow-hidden text-sm">
                    {Object.entries(filterParams.districts)
                      .filter(([_, checked]) => checked)
                      .map(([district]) => district)
                      .join(", ") || "請選擇行政區"}
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isDistrictDropdownOpen ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {isDistrictDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b">
                      <label className="flex items-center hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Object.values(filterParams.districts).every(
                            (v) => v
                          )}
                          onChange={() => {
                            const allChecked = Object.values(
                              filterParams.districts
                            ).every((v) => v);
                            const newValue = !allChecked;
                            setFilterParams((prev) => ({
                              ...prev,
                              districts: Object.keys(prev.districts).reduce(
                                (acc, district) => {
                                  acc[district] = newValue;
                                  return acc;
                                },
                                {}
                              ),
                            }));
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">全選</span>
                      </label>
                    </div>
                    {Object.entries(filterParams.districts).map(
                      ([district, isChecked]) => (
                        <label
                          key={district}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setFilterParams((prev) => ({
                                ...prev,
                                districts: {
                                  ...prev.districts,
                                  [district]: !isChecked,
                                },
                              }));
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{district}</span>
                        </label>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 來源 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">來源</h3>
            <div className="space-y-2">
              {["APP通報", "車巡", "機車"].map((source) => (
                <label key={source} className="flex items-center">
                  <input
                    type="radio" // 改為 radio
                    name="source" // 加入 name 以確保單選
                    checked={filterParams.sources.selected === source}
                    onChange={() => handleSourceChange(source)}
                    className="mr-2"
                  />
                  <span className="text-sm">{source}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 車輛選擇 */}
          {(filterParams.sources.selected === "車巡" ||
            filterParams.sources.selected === "機車") &&
            availableVehicles.length > 0 && (
              <div className="vehicle-dropdown">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  車輛選擇
                </h3>
                <div className="relative">
                  <div
                    className="w-full p-2 border rounded bg-white cursor-pointer flex justify-between items-center"
                    onClick={() =>
                      setIsVehicleDropdownOpen(!isVehicleDropdownOpen)
                    }
                  >
                    <div className="flex-1 overflow-hidden text-sm">
                      {filterParams.selectedVehicles.length > 0
                        ? filterParams.selectedVehicles.join(", ")
                        : "請選擇車輛"}
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isVehicleDropdownOpen ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  {isVehicleDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b">
                        <label className="flex items-center hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={availableVehicles.every((vehicle) =>
                              filterParams.selectedVehicles.includes(
                                vehicle.value
                              )
                            )}
                            onChange={() => {
                              const allSelected = availableVehicles.every(
                                (vehicle) =>
                                  filterParams.selectedVehicles.includes(
                                    vehicle.value
                                  )
                              );
                              setFilterParams((prev) => ({
                                ...prev,
                                selectedVehicles: allSelected
                                  ? []
                                  : availableVehicles.map((v) => v.value),
                              }));
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium">全選</span>
                        </label>
                      </div>
                      {availableVehicles.map((vehicle) => (
                        <label
                          key={vehicle.value}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filterParams.selectedVehicles.includes(
                              vehicle.value
                            )}
                            onChange={() => {
                              setFilterParams((prev) => ({
                                ...prev,
                                selectedVehicles:
                                  prev.selectedVehicles.includes(vehicle.value)
                                    ? prev.selectedVehicles.filter(
                                        (v) => v !== vehicle.value
                                      )
                                    : [...prev.selectedVehicles, vehicle.value],
                              }));
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{vehicle.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* 損壞項目 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">損壞項目</h3>
            <div className="space-y-2">
              {Object.entries(filterParams.damageTypes).map(
                ([type, isChecked]) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleDamageTypeChange(type)}
                      className="mr-2"
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* 查詢按鈕 */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`w-full py-2 px-4 rounded transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "查詢中..." : "查詢"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDisplay;
