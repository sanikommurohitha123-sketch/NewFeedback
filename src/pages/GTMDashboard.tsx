import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { api } from '../services/api';
import type { Country, Consultant } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Search, MapPin, User, ArrowRight, Filter, ArrowDownAZ } from 'lucide-react';
import FeedbackFormModal from '../components/dashboard/FeedbackFormModal.tsx';

const GTMDashboard: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Filters
  const [selectedCountryId, setSelectedCountryId] = useState<number | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NONE' | 'ASC' | 'DESC'>('NONE');
  
  const [expandedCountries, setExpandedCountries] = useState<Record<number, boolean>>({});
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [countriesData, consultantsData] = await Promise.all([
          api.getCountries(),
          api.getAllConsultants()
        ]);
        setCountries(countriesData);
        setConsultants(consultantsData);
        if (countriesData.length > 0) {
          setExpandedCountries({ [countriesData[0].id]: true });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleCountry = (countryId: number) => {
    setExpandedCountries(prev => ({
      ...prev,
      [countryId]: !prev[countryId]
    }));
  };

  // 1. Search filter
  let processedConsultants = consultants.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 2. Country filter
  if (selectedCountryId !== 'ALL') {
    processedConsultants = processedConsultants.filter(c => c.countryId === selectedCountryId);
  }

  // 3. Alphabetical Sort Filter
  if (sortOrder === 'ASC') {
    processedConsultants.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === 'DESC') {
    processedConsultants.sort((a, b) => b.name.localeCompare(a.name));
  }

  // Determine which countries to render based on the active country filter
  const visibleCountries = selectedCountryId === 'ALL' 
    ? countries 
    : countries.filter(c => c.id === selectedCountryId);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-0">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-8">
          <div className="space-y-2">
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-4xl font-black text-foreground tracking-tight"
            >
              Global Talent <span className="text-primary">Overview</span>
            </motion.h1>
            <p className="text-muted-foreground font-medium">Search, filter, and monitor performance across all regions.</p>
          </div>
          
          {/* Powerful Search Bar & Filters Area */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search name or role..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-card border border-border rounded-2xl text-sm font-semibold shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-foreground"
              />
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              {/* Country Dropdown Filter */}
              <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                <select
                  value={selectedCountryId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCountryId(val === 'ALL' ? 'ALL' : parseInt(val));
                    if (val !== 'ALL') {
                      setExpandedCountries({ [parseInt(val)]: true });
                    }
                  }}
                  className="w-full sm:w-auto appearance-none pl-10 pr-10 py-3.5 bg-card border border-border rounded-2xl text-sm font-semibold text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm cursor-pointer"
                >
                  <option value="ALL">All Countries</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none rotate-90" size={16} />
              </div>

              {/* A-Z Sort Toggle */}
              <button
                onClick={() => setSortOrder(prev => prev === 'NONE' ? 'ASC' : (prev === 'ASC' ? 'DESC' : 'NONE'))}
                title="Toggle Alphabetical Sort"
                className={`flex-none p-3.5 border rounded-2xl transition-all shadow-sm flex items-center gap-2 ${
                  sortOrder !== 'NONE' 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'bg-card border-border text-muted-foreground hover:text-primary hover:border-primary/50'
                }`}
              >
                <ArrowDownAZ size={20} />
                {sortOrder !== 'NONE' && <span className="text-sm font-bold block sm:hidden pr-2">{sortOrder === 'ASC' ? 'A-Z' : 'Z-A'}</span>}
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="bg-card rounded-[2.5rem] border border-border h-48 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {visibleCountries.map((country, countryIdx) => {
              const countryConsultants = processedConsultants.filter(c => c.countryId === country.id);
              if (countryConsultants.length === 0) return null;

              const isExpanded = expandedCountries[country.id] ?? (selectedCountryId !== 'ALL' || searchQuery.length > 0);

              return (
                <motion.section 
                  key={country.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: countryIdx * 0.1 }}
                  className="bg-card border border-border rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden"
                >
                  <button 
                    onClick={() => toggleCountry(country.id)}
                    className="w-full px-10 py-8 flex items-center justify-between hover:bg-muted/50 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl transition-all shadow-inner ${isExpanded ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
                        <MapPin size={24} />
                      </div>
                      <div className="text-left">
                        <h2 className="text-2xl font-black text-foreground">{country.name}</h2>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          {countryConsultants.length} TEAM MEMBERS
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      className="p-2 border border-border rounded-xl text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-all"
                    >
                      <ChevronRight size={24} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#fdfaf6]/50 dark:bg-muted/20"
                      >
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {countryConsultants.map((consultant, idx) => (
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              key={consultant.id}
                              className="group border border-border bg-card p-6 rounded-[2rem] hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 transition-all duration-500 relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 p-4">
                                <span className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full ${
                                  consultant.status === 'Active' ? 'bg-primary/20 text-primary' : 'bg-destructive/10 text-destructive'
                                }`}>
                                  {consultant.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 mb-6 pt-2">
                                <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary font-black text-xl shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                  {consultant.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                  <h3 className="font-bold text-foreground truncate">{consultant.name}</h3>
                                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">{consultant.role}</p>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => setSelectedConsultant(consultant)}
                                className="w-full flex items-center justify-between px-6 py-4 bg-muted/80 hover:bg-primary text-foreground hover:text-primary-foreground rounded-xl font-bold text-sm transition-all duration-300 group/btn shadow-inner hover:shadow-lg"
                              >
                                <span>Track Performance</span>
                                <ArrowRight size={18} className="translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.section>
              );
            })}
            
            {!loading && processedConsultants.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-40 text-center space-y-4 bg-card rounded-[3rem] border border-border shadow-sm"
              >
                <div className="w-24 h-24 bg-muted border border-border rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <User size={48} />
                </div>
                <h3 className="text-2xl font-black text-foreground">No consultants found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedConsultant && (
          <FeedbackFormModal 
            consultant={selectedConsultant} 
            countryName={countries.find(c => c.id === selectedConsultant.countryId)?.name || ''}
            onClose={() => setSelectedConsultant(null)} 
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default GTMDashboard;
