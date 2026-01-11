
import React, { useEffect, useState } from 'react';
import { Report } from '../types';
import { getAllReports, deleteReport, saveReport } from '../services/storage';
import { exportToPdf } from '../services/exportService';

interface PatientRecordsProps {
  onEditReport: (report: Report) => void;
}

const PatientRecords: React.FC<PatientRecordsProps> = ({ onEditReport }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadReports = async () => {
    setLoading(true);
    const data = await getAllReports();
    setReports(data.sort((a, b) => b.createdAt - a.createdAt));
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      await deleteReport(id);
      await loadReports();
    }
  };

  const handleExport = async (report: Report) => {
    await exportToPdf(report);
  };

  const handleSendEmail = async (report: Report) => {
    // Simulation d'envoi d'email
    alert(`Envoi du rapport pour ${report.horseName} par email...`);
    const updatedReport = { ...report, status: 'sent' as const };
    await saveReport(updatedReport);
    await loadReports();
  };

  const handleBulkEmail = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    alert(`Envoi groupé de ${count} rapports par email...`);
    
    for (const id of selectedIds) {
      const report = reports.find(r => r.id === id);
      if (report) {
        await saveReport({ ...report, status: 'sent' as const });
      }
    }
    setSelectedIds(new Set());
    await loadReports();
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredReports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredReports.map(r => r.id)));
    }
  };

  const filteredReports = reports.filter(r => 
    r.horseName.toLowerCase().includes(search.toLowerCase()) ||
    r.veterinary.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <span className="px-3 py-1 bg-[#005243] text-white text-[10px] font-black uppercase rounded-full">Validé</span>;
      case 'sent':
        return <span className="px-3 py-1 bg-[#7A59E8] text-white text-[10px] font-black uppercase rounded-full">Envoyé</span>;
      default:
        return <span className="px-3 py-1 bg-slate-200 text-slate-500 text-[10px] font-black uppercase rounded-full">Brouillon</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-black text-slate-800 uppercase italic">
          Archives <span className="text-[#7A59E8]">Patients</span>
        </h2>
        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <button 
              onClick={handleBulkEmail}
              className="flex items-center gap-2 bg-[#7A59E8] text-white px-6 py-3 rounded-2xl font-black uppercase text-xs animate-in zoom-in duration-300 btn-esquisse"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Envoyer ({selectedIds.size}) par email
            </button>
          )}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl px-12 py-3 focus:border-[#7A59E8] outline-none font-bold text-sm transition-all shadow-sm"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="w-12 h-12 border-4 border-[#7A59E8] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun dossier trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-[#7A59E8] focus:ring-[#7A59E8]" 
                      checked={selectedIds.size === filteredReports.length && filteredReports.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cheval</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Score</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-[#7A59E8] focus:ring-[#7A59E8]" 
                        checked={selectedIds.has(report.id)}
                        onChange={() => toggleSelect(report.id)}
                      />
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-500">{report.date}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">{report.horseName || 'Sans nom'}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dr. {report.veterinary}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-2xl font-black text-[#7A59E8]">{report.totalScore}</span>
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleSendEmail(report)}
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Envoyer par email"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => onEditReport(report)}
                          className="p-2 text-slate-400 hover:text-[#7A59E8] transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleExport(report)}
                          className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                          title="Télécharger PDF"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(report.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecords;
