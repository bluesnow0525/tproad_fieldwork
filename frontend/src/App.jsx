import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './component/Sidebar';
import Header from './component/Header';
import Footer from './component/Footer';
import Login from './pages/Login';

import Home from './pages/Home';
import CaseManagement from './pages/case/management';
import CaseReport from './pages/case/report';
import ApplicationCaseManagement from './pages/application/case-management';
import ApplicationRosterManagement from './pages/application/roster-management';
import ConstructionCaseManagement from './pages/construction/case-management';
import ConstructionSelfInspection from './pages/construction/self-inspection';
import ConstructionRosterProduction from './pages/construction/roster-production';
import Payment from './pages/payment/payment';
import RealTimeVehicle from './pages/map/real-time-vehicle';
import HistoricalTrack from './pages/map/historical-track';
import CaseDisplay from './pages/map/case-display';
import FleetCoverage from './pages/map/fleet-coverage';
import RoadHistoryAAR from './pages/road-history/aar';
import RoadHistoryPC from './pages/road-history/pc';
import RoadHistoryEPC from './pages/road-history/epc';
import MonthlyStatistics from './pages/statistics/monthly';
import YearlyStatistics from './pages/statistics/year';
import SystemManagementBidding from './pages/system-management/bidding';
import SystemManagementFleet from './pages/system-management/fleet';
import SystemManagementWorkAccount from './pages/system-management/work-account';
import SystemManagementSharedCode from './pages/system-management/shared-code';
import SystemManagementMenuPermission from './pages/system-management/menu-permission';
import SystemManagementChangeLog from './pages/system-management/change-log';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        
        {/* 案件管理 */}
        <Route path="/case/management" element={<Layout><CaseManagement /></Layout>} />
        <Route path="/case/report" element={<Layout><CaseReport /></Layout>} />
        
        {/* 申請單 */}
        <Route path="/application/case-management" element={<Layout><ApplicationCaseManagement /></Layout>} />
        <Route path="/application/roster-management" element={<Layout><ApplicationRosterManagement /></Layout>} />
        
        {/* 施工 */}
        <Route path="/construction/case-management" element={<Layout><ConstructionCaseManagement /></Layout>} />
        <Route path="/construction/self-inspection" element={<Layout><ConstructionSelfInspection /></Layout>} />
        <Route path="/construction/roster-production" element={<Layout><ConstructionRosterProduction /></Layout>} />
        
        {/* 請款 */}
        <Route path="/payment" element={<Layout><Payment /></Layout>} />
        
        {/* 圖台 */}
        <Route path="/map/real-time-vehicle" element={<Layout><RealTimeVehicle /></Layout>} />
        <Route path="/map/historical-track" element={<Layout><HistoricalTrack /></Layout>} />
        <Route path="/map/case-display" element={<Layout><CaseDisplay /></Layout>} />
        <Route path="/map/fleet-coverage" element={<Layout><FleetCoverage /></Layout>} />
        
        {/* 道路履歷 */}
        <Route path="/road-history/aar" element={<Layout><RoadHistoryAAR /></Layout>} />
        <Route path="/road-history/pc" element={<Layout><RoadHistoryPC /></Layout>} />
        <Route path="/road-history/epc" element={<Layout><RoadHistoryEPC /></Layout>} />
        
        {/* 查詢統計 */}
        <Route path="/statistics/monthly" element={<Layout><MonthlyStatistics /></Layout>} />
        <Route path="/statistics/yearly" element={<Layout><YearlyStatistics /></Layout>} />
        
        {/* 系統管理 */}
        <Route path="/system-management/bidding" element={<Layout><SystemManagementBidding /></Layout>} />
        <Route path="/system-management/fleet" element={<Layout><SystemManagementFleet /></Layout>} />
        <Route path="/system-management/work-account" element={<Layout><SystemManagementWorkAccount /></Layout>} />
        <Route path="/system-management/shared-code" element={<Layout><SystemManagementSharedCode /></Layout>} />
        <Route path="/system-management/menu-permission" element={<Layout><SystemManagementMenuPermission /></Layout>} />
        <Route path="/system-management/change-log" element={<Layout><SystemManagementChangeLog /></Layout>} />
      </Routes>
    </Router>
  );
}

function Layout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-64 p-8 w-full">{children}</main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
