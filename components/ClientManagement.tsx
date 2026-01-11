
import React, { useEffect, useState } from 'react';
import { Client, Report } from '../types';
import { getAllClients, saveClient, deleteClient, getAllReports } from '../services/storage';

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const loadData = async () => {
    const [c, r] = await Promise.all([getAllClients(), getAllReports()]);
    setClients(c);
    setReports(r);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: editingClient?.id || crypto.randomUUID(),
      ...formData,
      createdAt: editingClient?.createdAt || Date.now()
    };
    await saveClient(newClient);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setIsAdding(false);
    setEditingClient(null);
    await loadData();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce client ?')) {
      await deleteClient(id);
      await loadData();
    }
  };

  const getClientHorses = (clientId: string) => {
    return reports.filter(r => r.clientId === clientId).map(r => r.horseName);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase italic">
          Base de données <span className="text-[#7A59E8]">Clients</span>
        </h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#7A59E8] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs btn-esquisse"
        >
          Ajouter un Client
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[40px] shadow-lg border-2 border-[#7A59E8]/20 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom Complet</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-[#7A59E8] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
              <input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-[#7A59E8] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Téléphone</label>
              <input 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-[#7A59E8] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adresse</label>
              <input 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-[#7A59E8] outline-none"
              />
            </div>
            <div className="md:col-span-2 flex gap-4 pt-4">
              <button type="submit" className="bg-[#7A59E8] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs btn-esquisse">
                {editingClient ? 'Modifier' : 'Enregistrer'}
              </button>
              <button 
                type="button" 
                onClick={() => { setIsAdding(false); setEditingClient(null); }}
                className="bg-slate-100 text-slate-500 px-10 py-4 rounded-2xl font-black uppercase text-xs"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map(client => {
          const horses = Array.from(new Set(getClientHorses(client.id)));
          return (
            <div key={client.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase italic leading-none">{client.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{client.email || 'Pas d\'email'}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(client)} className="p-2 text-slate-300 hover:text-[#7A59E8]"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => handleDelete(client.id)} className="p-2 text-slate-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <svg className="w-4 h-4 text-[#7A59E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {client.phone || 'Non renseigné'}
                </div>
                
                <div className="pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest block mb-2">Chevaux reliés</span>
                  <div className="flex flex-wrap gap-2">
                    {horses.length > 0 ? horses.map((h, i) => (
                      <span key={i} className="px-3 py-1 bg-[#E2C2FF]/20 text-[#7A59E8] text-[10px] font-black uppercase rounded-lg">
                        {h}
                      </span>
                    )) : <span className="text-[10px] font-bold text-slate-300 italic">Aucun cheval enregistré</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientManagement;
