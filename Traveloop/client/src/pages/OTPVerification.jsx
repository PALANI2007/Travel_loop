import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, RefreshCcw, Plane, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTimer(59);
    setIsResending(false);
    toast.success('New voyager code sent!');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return toast.error('Please enter the full 6-digit code');

    setIsVerifying(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsVerifying(false);
    setIsSuccess(true);
    toast.success('Identity verified!');
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#020617] overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 bg-[#020617] relative">
        <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-primary-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-accent-600/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10 text-center"
        >
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="verification-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary-500/10 text-primary-500 mb-8 shadow-inner shadow-primary-500/20">
                  <Lock size={40} />
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Verify Your <span className="text-gradient">Identity</span></h1>
                <p className="text-slate-400 font-medium mb-10 leading-relaxed px-4">We've sent a unique explorer code to your registered email. Enter it below to unlock your dashboard.</p>

                <form onSubmit={handleVerify}>
                  <div className="flex justify-between gap-3 mb-10">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        className="w-full aspect-[3/4] max-w-[56px] bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-bold text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl font-extrabold hover:shadow-[0_10px_25px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Access Dashboard</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-10 flex flex-col items-center gap-4">
                  <div className="text-slate-500 font-medium text-sm">
                    {timer > 0 ? (
                      <span>Resend code available in <span className="text-primary-400 font-mono font-bold">{timer}s</span></span>
                    ) : (
                      <button
                        onClick={handleResend}
                        disabled={isResending}
                        className="text-primary-400 hover:text-primary-300 font-bold flex items-center gap-2 transition-colors group"
                      >
                        <RefreshCcw size={16} className={`${isResending ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        Resend Voyager Code
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-animation"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10"
              >
                <div className="relative inline-block mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                    className="w-28 h-28 bg-green-500/20 rounded-[2.5rem] flex items-center justify-center text-green-500 relative z-10"
                  >
                    <ShieldCheck size={64} />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-green-500/20 rounded-[2.5rem]"
                  />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Identity Confirmed!</h2>
                <p className="text-slate-400 font-medium text-lg">Preparing your personalized dashboard. <br />Safe travels, Voyager.</p>
                
                <div className="mt-12 flex justify-center">
                  <motion.div
                    animate={{ x: [-100, 100], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-primary-500"
                  >
                    <Plane size={48} className="transform -rotate-45" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right Side - Cinematic Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <motion.div 
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80" 
            alt="Airplane window" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-l from-[#020617]/90 via-[#020617]/40 to-transparent" />
        
        <div className="relative z-10 p-16 flex flex-col justify-end items-end w-full h-full text-right">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Your World, <br />
              <span className="text-gradient">Simplified.</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-sm mb-8 leading-relaxed font-medium">
              We take security seriously so you can focus on making memories. One loop closer to your destination.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
