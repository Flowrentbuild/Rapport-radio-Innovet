
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReportEditor from './components/ReportEditor';
import PatientRecords from './components/PatientRecords';
import ClientManagement from './components/ClientManagement';
import { Report } from './types';

enum View {
  Dashboard = 'dashboard',
  Editor = 'editor',
  Patients = 'patients',
  Clients = 'clients',
  Settings = 'settings'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [editingReport, setEditingReport] = useState<Report | undefined>(undefined);

  const handleNewReport = (prefilledData?: Partial<Report>) => {
    if (prefilledData) {
      const newReport: Report = {
        id: crypto.randomUUID(),
        horseName: prefilledData.horseName || '',
        clinic: 'BAILLY VÉTÉRINAIRES CLINIQUE ÉQUINE',
        date: new Date().toLocaleDateString('fr-FR'),
        veterinary: 'Christophe SCHLOTTERER',
        regions: prefilledData.regions || [],
        totalScore: prefilledData.totalScore || 0,
        createdAt: Date.now(),
        status: 'draft',
        ...prefilledData
      } as Report;
      setEditingReport(newReport);
    } else {
      setEditingReport(undefined);
    }
    setCurrentView(View.Editor);
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setCurrentView(View.Editor);
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard onNewReport={handleNewReport} onEditReport={handleEditReport} />;
      case View.Editor:
        return <ReportEditor initialData={editingReport} onSave={() => setCurrentView(View.Patients)} onCancel={() => setCurrentView(View.Dashboard)} />;
      case View.Patients:
        return <PatientRecords onEditReport={handleEditReport} />;
      case View.Clients:
        return <ClientManagement />;
      case View.Settings:
        return (
          <div className="bg-white p-12 rounded-[40px] shadow-sm border border-slate-100">
            <h2 className="text-3xl font-black text-slate-800 uppercase italic mb-8">Paramètres</h2>
            <div className="p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Configuration du profil Dr. Christophe Schlotterer active.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard onNewReport={handleNewReport} onEditReport={handleEditReport} />;
    }
  };

  return (
    <Layout 
      title={currentView.toUpperCase()}
      currentView={currentView}
      onNavigate={(v) => setCurrentView(v as View)}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
