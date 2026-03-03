
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import DashboardPage from './app/dashboard/page';
import { LeadList as LeadListPage } from './components/LeadList';
import { DealList as DealListPage } from './components/DealList';
import PropertyListPage from './app/hang-hoa/page';
import PropertyHubPage from './app/hang-hoa/[id]/hub/page';
import PropertyInspectionsPage from './app/properties/[id]/inspections/page';
import ProjectListPage from './app/projects/page';
import ProjectHubPage from './app/projects/[id]/hub/page';
import CustomerListPage from './app/khach-hang/page';
import CustomerHubPage from './app/khach-hang/[id]/hub/page';
import TransactionsPage from './app/giao-dich/page';
import LeaseListPage from './app/leases/page';
import NewLeasePage from './app/leases/new/page';
import EditLeasePage from './app/leases/[id]/edit/page';
import LeaseHubPage from './app/leases/[id]/hub/page';
import CareCasesPage from './app/care-cases/page';
import CareCaseHubPage from './app/care-cases/[id]/hub/page';
import PendingApprovalPage from './app/finance/pending-approval/page';
import CostListPage from './app/finance/costs/page';
import RemindersPage from './app/reminders/page';
import { ComingSoon } from './components/ComingSoon';
import { Bell, Search, User } from 'lucide-react';

const App = () => {
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [currentEntityId, setCurrentEntityId] = useState<string | null>(null);

  useEffect(() => {
    const handleRouteChange = (e: any) => {
      if (typeof e.detail === 'string') {
        setCurrentRoute(e.detail);
        setCurrentEntityId(null);
      } else {
        setCurrentRoute(e.detail.route);
        setCurrentEntityId(e.detail.id);
      }
    };
    window.addEventListener('routeChange', handleRouteChange);
    return () => window.removeEventListener('routeChange', handleRouteChange);
  }, []);

  const renderContent = () => {
    switch (currentRoute) {
      case 'dashboard': return <DashboardPage />;
      case 'leads': return <LeadListPage />;
      case 'deals': return <DealListPage />;
      case 'hang_hoa': return <PropertyListPage />;
      case 'property_hub': return <PropertyHubPage id={currentEntityId!} onBack={() => setCurrentRoute('hang_hoa')} />;
      case 'property_inspections': return <PropertyInspectionsPage id={currentEntityId!} params={{ id: currentEntityId! }} />;

      // Projects
      case 'projects': return <ProjectListPage />;
      case 'project_hub': return <ProjectHubPage id={currentEntityId!} />;

      case 'khach_hang': return <CustomerListPage />;
      case 'customer_hub': return <CustomerHubPage id={currentEntityId!} onBack={() => setCurrentRoute('khach_hang')} />;
      case 'giao_dich': return <TransactionsPage />;

      // Rental Services
      case 'leases': return <LeaseListPage />;
      case 'lease_new': return <NewLeasePage />;
      case 'lease_edit': return <EditLeasePage id={currentEntityId!} params={{ id: currentEntityId! }} />;
      case 'lease_hub': return <LeaseHubPage id={currentEntityId!} params={{ id: currentEntityId! }} />;
      case 'care_cases': return <CareCasesPage />;
      case 'care_case_hub': return <CareCaseHubPage id={currentEntityId!} params={{ id: currentEntityId! }} />;

      // Reminders
      case 'reminders': return <RemindersPage />;

      // Finance
      case 'pending_approval': return <PendingApprovalPage />;
      case 'cost_ledger': return <CostListPage />;

      // Settings
      case 'settings': return <ComingSoon />;
      default: return <ComingSoon />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-['Inter']">
      <Sidebar
        currentRoute={currentRoute}
        onChangeRoute={setCurrentRoute}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shrink-0 z-40">
          <div className="flex items-center gap-5 text-slate-400">
            <Search size={20} />
            <input
              placeholder="Tìm kiếm nhanh hệ thống (Cmd + K)..."
              className="bg-transparent border-none text-[15px] outline-none w-56 md:w-96 focus:w-[28rem] transition-all text-slate-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors" onClick={() => setCurrentRoute('reminders')}>
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-slate-800 leading-none">Phạm Minh Cường</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">GIÁM ĐỐC CHI NHÁNH</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto pb-16">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
