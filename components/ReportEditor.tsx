
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Report, GradeValue, GRADES_CONFIG, RegionData, ReportStatus, Client } from '../types';
import { INITIAL_REGIONS, DEFAULT_COMMENT } from '../constants';
import { analyzeDictation } from '../services/geminiService';
import { saveReport, getAllClients } from '../services/storage';
import { exportToDocx } from '../services/exportService';

interface ReportEditorProps {
  initialData?: Report;
  onSave: () => void;
  onCancel: () => void;
}

const ReportEditor: React.FC<ReportEditorProps> = ({ initialData, onSave, onCancel }) => {
  const [horseName, setHorseName] = useState(initialData?.horseName || '');
  const [clinic, setClinic] = useState(initialData?.clinic || 'BAILLY VÉTÉRINAIRES CLINIQUE ÉQUINE');
  const [date, setDate] = useState(initialData?.date || new Date().toLocaleDateString('fr-FR'));
  const [veterinary, setVeterinary] = useState(initialData?.veterinary || 'Christophe SCHLOTTERER');
  const [regions, setRegions] = useState<RegionData[]>(initialData?.regions || INITIAL_REGIONS);
  const [status, setStatus] = useState<ReportStatus>(initialData?.status || 'draft');
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [clients, setClients] = useState<Client[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const loadClients = async () => {
      const c = await getAllClients();
      setClients(c);
    };
    loadClients();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscription(prev => prev + finalTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscription('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleAnalyze = async () => {
    if (!transcription.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    
    const result = await analyzeDictation(transcription);
    if (result) {
      const updatedRegions = [...regions];
      result.regions.forEach(aiRegion => {
        const index = updatedRegions.findIndex(r => r.label === aiRegion.label);
        if (index !== -1 && !updatedRegions[index].isLocked) {
          updatedRegions[index].comment = aiRegion.comment || DEFAULT_COMMENT;
          updatedRegions[index].grade = (aiRegion.comment === "" ? 0 : aiRegion.grade) as GradeValue;
        }
      });
      setRegions(updatedRegions);
    } else {
      setError("L'analyse IA a échoué. Veuillez vérifier votre connexion.");
    }
    setIsAnalyzing(false);
  };

  const calculateTotalScore = useCallback(() => {
    return regions
      .filter(r => r.isIncluded)
      .reduce((sum, r) => sum + (GRADES_CONFIG[r.grade]?.points || 0), 0);
  }, [regions]);

  const handleUpdateRegion = (index: number, updates: Partial<RegionData>) => {
    const newRegions = [...regions];
    const updatedRegion = { ...newRegions[index], ...updates };
    if ('comment' in updates && updates.comment === "" && !('grade' in updates)) {
        updatedRegion.grade = GradeValue.G0;
    }
    newRegions[index] = updatedRegion;
    setRegions(newRegions);
  };

  const handleSave = async (newStatus?: ReportStatus) => {
    const finalStatus = newStatus || status;
    const report: Report = {
      id: initialData?.id || crypto.randomUUID(),
      horseName,
      clinic,
      date,
      veterinary,
      regions,
      totalScore: calculateTotalScore(),
      createdAt: initialData?.createdAt || Date.now(),
      status: finalStatus,
      clientId: clientId || undefined
    };
    await saveReport(report);
    onSave();
  };

  const handleExport = async () => {
    const report: Report = {
      id: initialData?.id || crypto.randomUUID(),
      horseName,
      clinic,
      date,
      veterinary,
      regions,
      totalScore: calculateTotalScore(),
      createdAt: initialData?.createdAt || Date.now(),
      status: 'sent',
      clientId: clientId || undefined
    };
    await exportToDocx(report);
    await saveReport(report);
    setStatus('sent');
    onSave();
  };

  const totalScore = calculateTotalScore();

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      {/* Header Info - Esquisse Style */}
      <section className="bg-white p-8 rounded-[30px] shadow-sm border-2 border-slate-200">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-6">
             <div className="border-4 border-[#0d0a0f] p-6 inline-block w-full rounded-2xl">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dossier Cheval</label>
                <input 
                  type="text" 
                  value={horseName} 
                  onChange={e => setHorseName(e.target.value)}
                  className="w-full text-4xl font-black border-none focus:ring-0 p-0 uppercase placeholder-slate-100 bg-transparent" 
                  placeholder="NOM DU CHEVAL"
                />
             </div>
             <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Relier à un client (facultatif)</label>
                <select 
                  value={clientId} 
                  onChange={e => setClientId(e.target.value)}
                  className="w-full bg-[#E2C2FF]/10 border-2 border-[#E2C2FF]/30 rounded-xl px-4 py-3 focus:border-[#7A59E8] transition-all font-bold"
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="w-full lg:w-80 space-y-6">
            <div className="flex flex-col">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date de l'examen</label>
                <input 
                  type="text" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-black text-indigo-700 text-center text-xl" 
                />
            </div>
            <div className="flex flex-col">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Vétérinaire</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-300 italic">Dr.</span>
                  <input 
                    type="text" 
                    value={veterinary} 
                    onChange={e => setVeterinary(e.target.value)}
                    className="w-full border-b-2 border-slate-200 focus:border-[#7A59E8] bg-transparent font-bold py-2 outline-none" 
                  />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dictation Box */}
      <section className="bg-[#120736] text-white rounded-[40px] shadow-2xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-full bg-halftone opacity-10 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 space-y-6 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></span>
                Dictée <span className="text-[#A38CF2]">Interactive</span>
              </h2>
              {transcription && (
                <button onClick={() => setTranscription('')} className="text-[#E2C2FF] hover:underline text-[10px] font-black uppercase tracking-widest">Réinitialiser</button>
              )}
            </div>
            <div className="min-h-[120px] p-6 bg-white/5 backdrop-blur-md rounded-3xl border-2 border-white/10 text-xl font-medium leading-relaxed italic text-slate-300">
              {transcription || <span className="opacity-30">Commencez à parler, l'IA s'occupe de la structure...</span>}
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col gap-4">
            <button 
              onClick={toggleRecording}
              className={`flex flex-col items-center justify-center gap-2 p-8 rounded-[30px] font-black uppercase tracking-tighter transition-all btn-esquisse ${
                isRecording 
                ? 'bg-red-500 shadow-xl shadow-red-500/20' 
                : 'bg-[#7A59E8] shadow-xl shadow-indigo-500/20'
              }`}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                 {isRecording ? <div className="w-4 h-4 bg-white rounded-sm animate-pulse"></div> : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" /></svg>}
              </div>
              <span className="text-xs">{isRecording ? 'STOP' : 'DICTER'}</span>
            </button>
            <button 
              disabled={isAnalyzing || !transcription}
              onClick={handleAnalyze}
              className="flex flex-col items-center justify-center gap-2 p-8 bg-[#005243] text-white rounded-[30px] font-black uppercase tracking-tighter disabled:opacity-30 btn-esquisse"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                {isAnalyzing ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              </div>
              <span className="text-xs">ANALYSE</span>
            </button>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-white rounded-[35px] shadow-2xl border-2 border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800 uppercase italic">Tableau <span className="text-[#7A59E8]">Radiographique</span></h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0d0a0f] text-white text-[10px] uppercase tracking-[0.3em]">
              <tr>
                <th className="px-8 py-4 font-black text-center">Incl.</th>
                <th className="px-8 py-4 font-black">Région anatomique</th>
                <th className="px-8 py-4 font-black">Commentaires détaillés</th>
                <th className="px-8 py-4 font-black w-64">Grading & Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {regions.map((region, idx) => (
                <tr key={region.id} className={`hover:bg-[#E2C2FF]/10 transition-colors ${!region.isIncluded ? 'opacity-20 grayscale bg-slate-50' : ''}`}>
                  <td className="px-8 py-6 text-center">
                    <input 
                      type="checkbox" 
                      checked={region.isIncluded}
                      onChange={e => handleUpdateRegion(idx, { isIncluded: e.target.checked })}
                      className="rounded-lg text-[#7A59E8] focus:ring-[#A38CF2] w-6 h-6 cursor-pointer"
                    />
                  </td>
                  <td className="px-8 py-6 align-top">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tighter underline decoration-[#A38CF2] underline-offset-4 decoration-2">
                      {region.label}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <textarea 
                      value={region.comment}
                      onChange={e => handleUpdateRegion(idx, { comment: e.target.value, isLocked: true })}
                      disabled={!region.isIncluded}
                      className="w-full text-sm border-none focus:ring-0 bg-transparent resize-none p-0 placeholder-slate-100 min-h-[60px] leading-relaxed font-semibold italic"
                      placeholder="Laisser vide si RAS..."
                    />
                  </td>
                  <td className="px-8 py-6 align-top">
                    <div className="space-y-3">
                        <select 
                          value={region.grade}
                          onChange={e => handleUpdateRegion(idx, { grade: parseInt(e.target.value) as GradeValue, isLocked: true })}
                          disabled={!region.isIncluded}
                          className="w-full text-xs font-black rounded-xl border-2 border-slate-100 focus:border-[#7A59E8] bg-white px-3 py-2"
                        >
                          {Object.values(GRADES_CONFIG).map(g => (
                            <option key={g.value} value={g.value}>{g.label} ({g.points} pts)</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">
                            {GRADES_CONFIG[region.grade].fullDescription}
                        </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-[#fff9e9] p-12 flex items-center justify-end border-t-4 border-[#0d0a0f]">
          <div className="text-right space-y-1">
            <p className="text-xs font-black text-[#A38CF2] uppercase tracking-[0.4em]">Score Radiographique Global</p>
            <p className="text-8xl font-black text-[#0d0a0f] italic leading-none">{totalScore}</p>
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <div className="fixed bottom-10 right-10 left-10 flex items-center justify-between p-6 bg-[#0d0a0f] shadow-2xl rounded-[30px] z-50">
        <button 
          onClick={onCancel}
          className="px-8 py-3 text-white/50 font-black uppercase tracking-widest hover:text-white transition-colors"
        >
          ANNULER
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => handleSave('validated')}
            className="hidden md:flex items-center gap-2 px-8 py-4 bg-[#005243] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-[#66BAA7] transition-all btn-esquisse"
          >
            VALIDER
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-8 py-4 bg-white text-[#0d0a0f] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all btn-esquisse"
          >
            TÉLÉCHARGER WORD
          </button>
          <button 
            onClick={() => handleSave('draft')}
            className="flex items-center gap-2 px-12 py-4 bg-[#7A59E8] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/40 hover:scale-105 transition-all btn-esquisse"
          >
            ENREGISTRER
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportEditor;
