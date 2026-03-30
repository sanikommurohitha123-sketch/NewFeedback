import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<'GTM' | 'CU'>('GTM');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success(result.message);
        if (role === 'GTM') {
          navigate('/gtm/dashboard');
        } else {
          navigate('/cu/dashboard');
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfaf6] dark:bg-[#1a1f24] transition-colors duration-500 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-200/30 dark:bg-amber-500/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-lg p-4"
      >
        <div className="bg-card rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-border overflow-hidden">
          <div className="p-8 pb-4 text-center">
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-lg mb-6"
            >
              <Lock size={32} />
            </motion.div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">System Login</h2>
            <p className="text-muted-foreground mt-2">Sign in to your dashboard</p>
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Role Toggle */}
              <div className="flex bg-muted p-1 rounded-2xl w-full relative">
                <button
                  type="button"
                  onClick={() => setRole('GTM')}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all z-10 flex flex-col items-center gap-1 ${role === 'GTM' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <span className="block mt-0.5 z-20">GTM Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('CU')}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all z-10 flex flex-col items-center gap-1 ${role === 'CU' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <span className="block mt-0.5 z-20">CU Login</span>
                </button>

                <motion.div
                  className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-xl z-0 shadow-sm"
                  initial={false}
                  animate={{ 
                    x: role === 'GTM' ? 0 : '100%',
                    marginLeft: role === 'GTM' ? 0 : 4
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="email" 
                    required
                    placeholder={role === 'GTM' ? "name.gtm@enterprise.com" : "name.cu@enterprise.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all disabled:opacity-70 mt-4 shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
