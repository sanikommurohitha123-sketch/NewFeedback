import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Consultant, Feedback, Country } from '../types';
import { Search, History, Star, Calendar, MessageSquare, User, ArrowRight, CheckCircle2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackFormModal from '../components/dashboard/FeedbackFormModal.tsx';

const CUDashboard: React.FC = () => {
  const { user } = useAuth();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const [team, allCountries] = await Promise.all([
          api.getAssignedConsultants(user!.id),
          api.getCountries()
        ]);
        setConsultants(team);
        setCountries(allCountries);
        if (team.length > 0) {
          handleSelectConsultant(team[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTeam();
  }, [user]);

  const handleSelectConsultant = async (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setLoadingHistory(true);
    try {
      const history = await api.getFeedbackHistory(consultant.id);
      setFeedbackHistory(history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFeedbackAdded = async () => {
    setIsModalOpen(false);
    if (selectedConsultant) {
      handleSelectConsultant(selectedConsultant); // Refresh history
    }
  };

  const filteredConsultants = consultants.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-8 px-4 sm:px-0">
        
        {/* Left Side: Team Sidebar */}
        <div className="w-full lg:w-80 flex flex-col shrink-0 gap-6">
          <header className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">My Team</h1>
            <p className="text-sm font-semibold text-muted-foreground">Manage {consultants.length} members</p>
          </header>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search team..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-card border border-border rounded-2xl text-sm font-semibold shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-foreground"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="animate-pulse bg-card h-24 rounded-[2rem] border border-border" />)
            ) : filteredConsultants.map(consultant => (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={consultant.id}
                onClick={() => handleSelectConsultant(consultant)}
                className={`w-full text-left p-5 rounded-[2rem] transition-all border group relative overflow-hidden ${
                  selectedConsultant?.id === consultant.id
                    ? 'bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20'
                    : 'bg-card border-border hover:border-primary/50 text-foreground text-muted-foreground'
                }`}
              >
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className={`font-bold transition-colors ${selectedConsultant?.id === consultant.id ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {consultant.name}
                  </div>
                  {selectedConsultant?.id === consultant.id && <CheckCircle2 size={16} className="text-primary-foreground/80 drop-shadow-md" />}
                </div>
                <div className={`text-xs font-semibold truncate relative z-10 ${selectedConsultant?.id === consultant.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {consultant.role}
                </div>
                {selectedConsultant?.id === consultant.id && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary z-0 opacity-100 dark:brightness-110"
                  />
                )}
              </motion.button>
            ))}
            {!loading && filteredConsultants.length === 0 && (
              <div className="py-10 text-center space-y-3">
                <User size={32} className="mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground/80 font-bold text-sm">No members found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Timeline View */}
        <div className="flex-1 bg-card border border-border rounded-[3rem] shadow-sm flex flex-col overflow-hidden">
          {selectedConsultant ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedConsultant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                {/* Profile Header */}
                <div className="px-10 py-10 border-b border-border flex flex-col sm:flex-row items-center gap-6 bg-muted/30">
                  <div className="w-24 h-24 bg-primary/20 text-primary rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-inner">
                    {selectedConsultant.name[0]}
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h2 className="text-4xl font-black text-foreground tracking-tight mb-2">{selectedConsultant.name}</h2>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 items-center">
                      <span className="px-3 py-1 bg-card shadow-sm border border-border rounded-full text-xs font-bold text-muted-foreground uppercase tracking-widest">{selectedConsultant.role}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${selectedConsultant.status === 'Active' ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>{selectedConsultant.status}</span>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Plus size={20} /> Add Feedback
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                  <div className="flex items-center gap-2 mb-10">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                      <History size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Performance Timeline</h3>
                  </div>

                  <div className="relative pl-10">
                    {/* Line */}
                    <div className="absolute left-0 top-3 bottom-0 w-px bg-border" />

                    {loadingHistory ? (
                      <div className="space-y-6">
                        {[1, 2].map(i => <div key={i} className="animate-pulse bg-muted h-32 rounded-3xl" />)}
                      </div>
                    ) : feedbackHistory.length > 0 ? (
                      feedbackHistory.map((fb, idx) => (
                        <div key={fb.id} className="relative mb-10 last:mb-0">
                          {/* Dot */}
                          <div className="absolute -left-[45px] top-1.5 w-5 h-5 rounded-full bg-card border-2 border-primary z-10 shadow-sm" />
                          
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card border border-border p-8 rounded-[2.5rem] hover:shadow-xl hover:border-primary/20 transition-all group"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-muted rounded-2xl text-muted-foreground">
                                  <User size={20} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">EVALUATOR</p>
                                  <p className="font-bold text-foreground">Global/Regional Manager</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20">
                                <span className="text-xl font-black text-amber-500">{fb.rating}.0</span>
                                <Star size={18} className="fill-amber-500 text-amber-500" />
                              </div>
                            </div>
                            
                            <p className="text-foreground font-medium leading-relaxed italic mb-6">
                              "{fb.comments}"
                            </p>

                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted px-4 py-2 rounded-full w-fit">
                              <Calendar size={14} />
                              {format(new Date(fb.createdAt), 'MMMM d, yyyy')}
                            </div>
                          </motion.div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                          <MessageSquare size={40} />
                        </div>
                        <h4 className="text-lg font-bold text-foreground">No Feedback Data</h4>
                        <p className="text-muted-foreground max-w-xs mx-auto text-sm">No performance reviews have been added for this member yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 space-y-6 text-center">
              <div className="w-32 h-32 bg-muted rounded-[3rem] flex items-center justify-center text-muted-foreground/30">
                <ArrowRight size={64} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">Select Member</h3>
                <p className="text-muted-foreground max-w-sm">Choose a consultant from your team to explore detailed performance analytics and history.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal Integration */}
      <AnimatePresence>
        {isModalOpen && selectedConsultant && (
          <FeedbackFormModal 
            consultant={selectedConsultant} 
            countryName={countries.find(c => c.id === selectedConsultant.countryId)?.name || 'Unknown'}
            onClose={handleFeedbackAdded} 
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default CUDashboard;
