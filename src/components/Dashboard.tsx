import React, { useState } from "react";
import Sidebar from "./Sidebar";
import CarManagement from "./CarManagement";
import InspectionBookings from "./InspectionBookings";
import Purchases from "./Purchases";
import SellRequests from "./SellRequests";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("cars");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "cars":
        return <CarManagement />;
      case "inspections":
        return <InspectionBookings />;
      case "purchases":
        return <Purchases />;
      case "sell-requests":
        return <SellRequests />;
      default:
        return <CarManagement />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 lg:ml-0 overflow-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Dashboard;
