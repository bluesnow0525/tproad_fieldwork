import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

function PrivateRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* 使用 PrivateRoute 保護所有需要登入的路由 */}
          <Route path="/home" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          
          {/* 案件管理 */}
          <Route path="/case/management" element={
            <PrivateRoute>
              <CaseManagement />
            </PrivateRoute>
          } />
          <Route path="/case/report" element={
            <PrivateRoute>
              <CaseReport />
            </PrivateRoute>
          } />
          
          {/* 申請單 */}
          <Route path="/application/case-management" element={
            <PrivateRoute>
              <ApplicationCaseManagement />
            </PrivateRoute>
          } />
          <Route path="/application/roster-management" element={
            <PrivateRoute>
              <ApplicationRosterManagement />
            </PrivateRoute>
          } />
          
          {/* 施工 */}
          <Route path="/construction/case-management" element={
            <PrivateRoute>
              <ConstructionCaseManagement />
            </PrivateRoute>
          } />
          <Route path="/construction/self-inspection" element={
            <PrivateRoute>
              <ConstructionSelfInspection />
            </PrivateRoute>
          } />
          <Route path="/construction/roster-production" element={
            <PrivateRoute>
              <ConstructionRosterProduction />
            </PrivateRoute>
          } />
          
          {/* 請款 */}
          <Route path="/payment" element={
            <PrivateRoute>
              <Payment />
            </PrivateRoute>
          } />
          
          {/* 圖台 */}
          <Route path="/map/real-time-vehicle" element={
            <PrivateRoute>
              <RealTimeVehicle />
            </PrivateRoute>
          } />
          <Route path="/map/historical-track" element={
            <PrivateRoute>
              <HistoricalTrack />
            </PrivateRoute>
          } />
          <Route path="/map/case-display" element={
            <PrivateRoute>
              <CaseDisplay />
            </PrivateRoute>
          } />
          <Route path="/map/fleet-coverage" element={
            <PrivateRoute>
              <FleetCoverage />
            </PrivateRoute>
          } />
          
          {/* 道路履歷 */}
          <Route path="/road-history/aar" element={
            <PrivateRoute>
              <RoadHistoryAAR />
            </PrivateRoute>
          } />
          <Route path="/road-history/pc" element={
            <PrivateRoute>
              <RoadHistoryPC />
            </PrivateRoute>
          } />
          <Route path="/road-history/epc" element={
            <PrivateRoute>
              <RoadHistoryEPC />
            </PrivateRoute>
          } />
          
          {/* 查詢統計 */}
          <Route path="/statistics/monthly" element={
            <PrivateRoute>
              <MonthlyStatistics />
            </PrivateRoute>
          } />
          <Route path="/statistics/yearly" element={
            <PrivateRoute>
              <YearlyStatistics />
            </PrivateRoute>
          } />
          
          {/* 系統管理 */}
          <Route path="/system-management/bidding" element={
            <PrivateRoute>
              <SystemManagementBidding />
            </PrivateRoute>
          } />
          <Route path="/system-management/fleet" element={
            <PrivateRoute>
              <SystemManagementFleet />
            </PrivateRoute>
          } />
          <Route path="/system-management/work-account" element={
            <PrivateRoute>
              <SystemManagementWorkAccount />
            </PrivateRoute>
          } />
          <Route path="/system-management/shared-code" element={
            <PrivateRoute>
              <SystemManagementSharedCode />
            </PrivateRoute>
          } />
          <Route path="/system-management/menu-permission" element={
            <PrivateRoute>
              <SystemManagementMenuPermission />
            </PrivateRoute>
          } />
          <Route path="/system-management/change-log" element={
            <PrivateRoute>
              <SystemManagementChangeLog />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function Layout({ children }) {
  const { user } = useAuth();  // 可以在 Layout 中使用使用者資訊
  
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
