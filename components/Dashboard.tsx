
import React, { useEffect, useState, useRef } from 'react';
import { Report, GradeValue, GRADES_CONFIG } from '../types';
import { getAllReports } from '../services/storage';
import { analyzeFullSession } from '../services/geminiService';
import { INITIAL_REGIONS, DEFAULT_COMMENT } from '../constants';

interface DashboardProps {
  onNewReport: (prefilledData?: Partial<Report>) => void;
  onEditReport: (report: Report) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewReport, onEditReport }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fullTranscript, setFullTranscript] = useState('');
  const [currentInterim, setCurrentInterim] = useState('');
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadReports = async () => {
      const data = await getAllReports();
      setReports(data);
    };
    loadReports();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        if (final) {
          setFullTranscript(prev => prev + final);
        }
        setCurrentInterim(interim);
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [fullTranscript, currentInterim]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleGenerateReport = async () => {
    if (!fullTranscript.trim() && !currentInterim.trim()) return;
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    setIsGenerating(true);
    
    const textToAnalyze = fullTranscript + ' ' + currentInterim;
    const aiResult = await analyzeFullSession(textToAnalyze);
    
    if (aiResult) {
      const updatedRegions = INITIAL_REGIONS.map(r => {
        const found = aiResult.regions.find(aiR => aiR.label === r.label);
        if (found) {
          return { 
            ...r, 
            comment: found.comment || DEFAULT_COMMENT, 
            grade: (found.comment === DEFAULT_COMMENT || found.comment === "" || found.comment === "RAS" ? 0 : found.grade) as GradeValue, 
            isIncluded: true 
          };
        }
        return r;
      });

      const score = updatedRegions
        .filter(r => r.isIncluded)
        .reduce((sum, r) => sum + (GRADES_CONFIG[r.grade]?.points || 0), 0);

      onNewReport({
        horseName: aiResult.horseName || '',
        regions: updatedRegions,
        totalScore: score
      });
    }
    
    setIsGenerating(false);
  };

  const stats = {
    total: reports.length,
    draft: reports.filter(r => r.status === 'draft' || !r.status).length,
    validated: reports.filter(r => r.status === 'validated').length,
    sent: reports.filter(r => r.status === 'sent').length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total rédigés', val: stats.total, color: 'border-slate-300' },
          { label: 'En cours', val: stats.draft, color: 'border-[#A38CF2]' },
          { label: 'Validés', val: stats.validated, color: 'border-[#005243]' },
          { label: 'Envoyés', val: stats.sent, color: 'border-[#7A59E8]' },
        ].map((s, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border-2 ${s.color} flex flex-col justify-between hover:shadow-lg transition-all`}>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</span>
            <span className="text-4xl font-black text-slate-800 mt-2">{s.val}</span>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-800 uppercase italic leading-tight">
              Rédiger un rapport <span className="text-[#7A59E8]">avec l'IA</span>
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Utilisez la dictée vocale pour générer un compte-rendu instantané</p>
          </div>
          
          <button 
            onClick={toggleRecording}
            className={`flex items-center gap-4 px-8 py-5 rounded-[25px] font-black uppercase tracking-tighter transition-all transform hover:scale-105 active:scale-95 btn-esquisse shadow-2xl ${
              isRecording 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-[#7A59E8] text-white hover:bg-[#A38CF2]'
            }`}
          >
            <span>{isRecording ? 'ARRÊTER LA DICTÉE' : 'ACTIVER LE MICRO'}</span>
            {isRecording ? (
              <div className="w-5 h-5 bg-white rounded-md"></div>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" /></svg>
            )}
          </button>
        </div>

        <section className="bg-white rounded-[40px] shadow-2xl border-2 border-slate-100 flex flex-col h-[650px] overflow-hidden">
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <h3 className="text-lg font-black text-slate-800 uppercase italic">Transcription <span className="text-[#7A59E8]">en Direct</span></h3>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setFullTranscript('')} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Effacer la transcription">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 flex flex-col p-10 space-y-4 bg-[#fff9e9]/50 bg-halftone"
          >
            {!fullTranscript && !currentInterim && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                <div className="w-24 h-24 bg-[#7A59E8]/10 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#7A59E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <p className="font-black uppercase tracking-[0.3em] text-xs max-w-xs">Le scribe attend votre signal. Cliquez sur "ACTIVER LE MICRO" pour commencer.</p>
              </div>
            )}

            <div className="flex-1 flex flex-col gap-6">
              <textarea
                value={fullTranscript}
                onChange={(e) => setFullTranscript(e.target.value)}
                disabled={isRecording}
                placeholder={isRecording ? "L'IA vous écoute..." : "Le texte transcrit s'affichera ici. Vous pourrez le modifier manuellement avant de générer le rapport."}
                className="flex-1 w-full bg-white p-8 rounded-[35px] border-2 border-slate-100 shadow-sm text-black font-semibold italic text-xl leading-relaxed focus:border-[#7A59E8] outline-none transition-all resize-none placeholder:text-slate-400"
              />
              
              {currentInterim && (
                <div className="p-6 bg-[#E2C2FF]/20 rounded-2xl border-2 border-dashed border-[#A38CF2] animate-pulse">
                  <p className="text-black font-semibold italic text-lg">{currentInterim}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-10 bg-white border-t border-slate-100">
            <button 
              disabled={(!fullTranscript.trim() && !currentInterim.trim()) || isGenerating}
              onClick={handleGenerateReport}
              className="w-full flex items-center justify-center gap-4 py-8 bg-[#7A59E8] text-white rounded-[30px] disabled:opacity-20 hover:bg-[#A38CF2] transition-all shadow-2xl shadow-indigo-500/20 group btn-esquisse"
            >
              {isGenerating ? (
                <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              )}
              <span className="font-black uppercase tracking-[0.2em] text-lg">Générer le Rapport Radiographique</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
