import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Award, Play, Eye, X, Check } from 'lucide-react';
import { type Envelope, type Team } from '../utils/defaults';

interface EnvelopeWidgetProps {
  envelope: Envelope;
  team: Team | null;
  isActive: boolean;
  animationStep: 'closed' | 'zoomed' | 'opened' | 'revealed';
  onOpen: () => void;
  onStepChange: (step: 'closed' | 'zoomed' | 'opened' | 'revealed') => void;
  onClose: () => void;
  onMarkAsOpened: (id: string, wasSuccessful: boolean, awardPoints: number) => void;
  role: 'public' | 'admin';
  displayLabel?: string;
}

export const EnvelopeWidget: React.FC<EnvelopeWidgetProps> = ({
  envelope,
  team,
  isActive,
  animationStep,
  onOpen,
  onStepChange,
  onClose,
  onMarkAsOpened,
  role,
  displayLabel
}) => {
  const teamColor = team ? team.color : '#d4af37'; // Default gold

  // Handle envelope clicks based on role/state
  const handleEnvelopeClick = () => {
    if (envelope.isOpened && !isActive) return;
    if (!isActive) {
      onOpen();
    }
  };

  return (
    <>
      {/* 1. Normal grid item card */}
      <motion.div
        layoutId={`envelope-wrapper-${envelope.id}`}
        onClick={handleEnvelopeClick}
        className={`relative w-full aspect-[3/2] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl border transition-all duration-300 transform hover:-translate-y-1 ${
          envelope.isOpened 
            ? 'opacity-40 grayscale border-slate-700 bg-slate-900/50 cursor-not-allowed' 
            : 'border-white/10'
        }`}
        style={{
          backgroundColor: envelope.isOpened ? '#121420' : teamColor,
          boxShadow: !envelope.isOpened ? `0 8px 30px ${teamColor}30, inset 0 2px 4px rgba(255,255,255,0.2)` : 'none',
        }}
        whileHover={!envelope.isOpened ? { scale: 1.03 } : {}}
        whileTap={!envelope.isOpened ? { scale: 0.98 } : {}}
      >
        {/* Envelope back flap visual lines / Shadow overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/50 pointer-events-none" />
        
        {/* Top diagonal folds of a closed envelope */}
        <div 
          className="absolute inset-x-0 top-0 h-1/2 border-b border-r border-black/20"
          style={{
            clipPath: 'polygon(0% 0%, 50% 60%, 100% 0%)',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
            borderBottom: '1.5px solid rgba(0, 0, 0, 0.2)',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0% 100%, 50% 60%, 100% 100%)',
            background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
          }}
        />

        {/* Content container */}
        <div className="absolute inset-0 flex flex-col justify-between p-5 z-10">
          {/* Points at the top instead of name */}
          <div className="text-center w-full pt-1 flex justify-center items-center">
            <div className={`flex items-center space-x-1.5 ${envelope.isOpened ? 'text-slate-500' : 'text-amber-200 bg-black/20 px-3.5 py-1 rounded-full border border-amber-300/10 shadow-inner'}`}>
              <Award size={14} className={envelope.isOpened ? "" : "animate-pulse"} />
              <span className="text-xs md:text-sm font-black tracking-widest uppercase">{envelope.points} PUNTI</span>
            </div>
          </div>

          {/* Empty center for the wax seal */}
          <div className="h-10 pointer-events-none" />

          {/* Team Name at the bottom instead of points */}
          <div className={`flex justify-center items-center text-xs border-t pt-3 ${
            envelope.isOpened 
              ? 'text-slate-500 border-slate-800/80' 
              : 'text-white/80 border-white/15'
          }`}>
            <h3 className="text-xs md:text-sm font-bold tracking-wider text-slate-100 uppercase truncate drop-shadow">
              {team ? team.name : 'Busta Libera'}
            </h3>
          </div>
        </div>

        {/* Wax Seal */}
        {!envelope.isOpened && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-10 h-10 rounded-full flex items-center justify-center border shadow-lg cursor-pointer"
              style={{
                background: `radial-gradient(circle, #fbe7a1 0%, #d4af37 60%, #a27a0d 100%)`,
                borderColor: '#ffffff70',
                boxShadow: `0 4px 12px rgba(0,0,0,0.35), 0 0 12px rgba(212, 175, 55, 0.4)`
              }}
            >
              <Mail size={16} className="text-slate-950" />
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* 2. Interactive Zoom & Fullscreen Overlay View */}
      <AnimatePresence>
        {isActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-hidden">
            {/* Dark background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={role === 'public' ? undefined : onClose}
              className="absolute inset-0 bg-[#07080ddf] backdrop-blur-md"
            />

            {/* Main Interactive Stage */}
            <div className="relative w-full max-w-2xl flex flex-col items-center justify-center z-10 py-12">
              
              {/* Outer Envelope Wrapper */}
              <motion.div
                layoutId={`envelope-wrapper-${envelope.id}`}
                className="relative w-full max-w-md md:max-w-xl aspect-[3/2] rounded-2xl border shadow-2xl flex flex-col justify-between overflow-visible perspective-1000 transform-style-3d"
                style={{
                  backgroundColor: teamColor,
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: `0 15px 50px ${teamColor}35, 0 0 100px rgba(0,0,0,0.85)`,
                }}
              >
                {/* ENVELOPE BACKSIDE GRAPHICS */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/50 rounded-2xl overflow-hidden pointer-events-none"
                  style={{ backgroundColor: teamColor }}
                />

                {/* LEFT FLAP */}
                <div 
                  className="absolute inset-y-0 left-0 w-1/2 border-r border-black/10 pointer-events-none"
                  style={{
                    clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)',
                    background: 'linear-gradient(to right, rgba(255,255,255,0.05), rgba(0,0,0,0.15))'
                  }}
                />
                
                {/* RIGHT FLAP */}
                <div 
                  className="absolute inset-y-0 right-0 w-1/2 border-l border-black/10 pointer-events-none"
                  style={{
                    clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)',
                    background: 'linear-gradient(to left, rgba(255,255,255,0.05), rgba(0,0,0,0.15))'
                  }}
                />

                {/* BOTTOM FLAP */}
                <div 
                  className="absolute inset-x-0 bottom-0 h-2/3 border-t border-black/10 pointer-events-none z-10"
                  style={{
                    clipPath: 'polygon(0% 100%, 50% 30%, 100% 100%)',
                    backgroundColor: teamColor,
                    backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.1))',
                    borderTop: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                />

                {/* THE CHALLENGE SHEET (SLIDES OUT) */}
                <motion.div
                  initial={false}
                  animate={{
                    y: 
                      animationStep === 'closed' || animationStep === 'zoomed' 
                        ? 0 
                        : animationStep === 'opened' 
                          ? '-38%' 
                          : '-2%', // Re-centers on screen to prevent being cut off at the top
                    scale: animationStep === 'revealed' ? 1.05 : 0.93, // Reduced scale to rely on layout expansion instead
                    zIndex: animationStep === 'revealed' ? 40 : (animationStep === 'opened' ? 25 : 5),
                    boxShadow: animationStep === 'revealed' 
                      ? '0 25px 65px rgba(0, 0, 0, 0.95), 0 0 50px rgba(212, 175, 55, 0.45)' 
                      : '0 5px 15px rgba(0, 0, 0, 0.5)'
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 80,
                    damping: 18,
                    mass: 1.1
                  }}
                  className={`absolute bg-amber-50 rounded-lg p-5 flex flex-col justify-between text-slate-900 overflow-hidden transform-style-3d transition-all duration-300 ${
                    animationStep === 'revealed' 
                      ? 'inset-x-[-12%] top-[-25%] bottom-[-25%] md:inset-x-[-20%] md:top-[-30%] md:bottom-[-30%]' 
                      : 'inset-x-6 top-6 bottom-6'
                  }`}
                  style={{
                    border: '8px double #d4af37',
                    backgroundImage: 'radial-gradient(circle, #fdfbf7 60%, #f4ebd0 100%)'
                  }}
                >
                  {/* Decorative Frame */}
                  <div className="absolute inset-2 border border-[#d4af37] opacity-60 pointer-events-none" />

                  {/* Document Header */}
                  <div className="flex justify-between items-center border-b border-[#d4af37]/30 pb-2 z-10">
                    <span className="font-cinzel text-xs font-bold tracking-widest text-[#aa7c11]">
                      {displayLabel || envelope.label}
                    </span>
                  </div>

                  {/* Document Body */}
                  <div className="flex-1 flex flex-col justify-center my-2 text-center z-10">
                    {animationStep === 'revealed' ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="space-y-3"
                      >
                        <h2 className="text-xl md:text-2xl font-black font-cinzel text-slate-950 uppercase tracking-wide">
                          {envelope.title}
                        </h2>

                        <p className="text-sm md:text-lg lg:text-xl font-serif leading-relaxed italic text-slate-800 max-w-xl mx-auto pt-1 px-4">
                          "{envelope.content}"
                        </p>
                      </motion.div>
                    ) : (
                      <div className="text-slate-400 font-cinzel tracking-widest text-xs uppercase animate-pulse">
                        Sigillo intatto. Rivelare contenuto...
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* TOP FLAP (3D ROTATING SHAPE) */}
                <motion.div
                  initial={false}
                  animate={{
                    rotateX: animationStep === 'closed' || animationStep === 'zoomed' ? 0 : -180,
                    zIndex: animationStep === 'closed' || animationStep === 'zoomed' ? 30 : 2,
                  }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="absolute inset-x-0 top-0 h-1/2 origin-top transform-style-3d pointer-events-none"
                  style={{
                    clipPath: 'polygon(0% 0%, 50% 60%, 100% 0%)',
                    backgroundColor: teamColor,
                    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(0,0,0,0.3))',
                    borderBottom: '2.5px solid rgba(255,255,255,0.25)',
                    backfaceVisibility: 'hidden',
                  }}
                />

                {/* TOP FLAP OUTSIDE FACE (shown when flap is folded open, i.e. pointing upwards) */}
                <motion.div
                  initial={false}
                  animate={{
                    rotateX: animationStep === 'closed' || animationStep === 'zoomed' ? 180 : 0,
                    zIndex: 2,
                  }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="absolute inset-x-0 -top-1/2 h-1/2 origin-bottom pointer-events-none transform-style-3d"
                  style={{
                    clipPath: 'polygon(0% 100%, 50% 40%, 100% 100%)',
                    backgroundColor: teamColor,
                    backgroundImage: 'linear-gradient(to top, rgba(255,255,255,0.2), rgba(0,0,0,0.25))',
                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                  }}
                />

                {/* SHADOW OVERLAY ON THE ENVELOPE BASE */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-15" />

                {/* BOTTOM BRANDING LABELS */}
                <div className="absolute bottom-5 inset-x-0 flex flex-col items-center justify-end z-25 text-center pointer-events-none">
                  <h3 className="font-cinzel text-xl font-bold tracking-wider text-slate-100">
                    {team ? team.name : 'Busta Libera'}
                  </h3>
                  <div className="w-16 h-1 mt-1 rounded-full" style={{ backgroundColor: teamColor }} />
                </div>

                {/* WAX SEAL (GOLDEN BUTTON, TRIGGERS OPENING) */}
                <AnimatePresence>
                  {(animationStep === 'zoomed') && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-35"
                    >
                      <button
                        onClick={() => onStepChange('opened')}
                        className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 border-amber-300 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                        style={{
                          background: `radial-gradient(circle, #f3e5ab, ${teamColor})`,
                          boxShadow: `0 0 35px ${teamColor}`,
                        }}
                      >
                        <Play size={20} className="text-slate-950 fill-slate-950 ml-1" />
                        <span className="text-[8px] font-bold text-slate-950 font-sans tracking-wide">APRI</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ACTION TOOLBAR & STAGE CONTROLLER (visible for both or admin) */}
              <div className="mt-8 flex flex-wrap gap-4 items-center justify-center z-50">
                {/* 1. Zoomed, waiting to open */}
                {animationStep === 'zoomed' && (
                  <button
                    onClick={() => onStepChange('opened')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold font-sans rounded-full flex items-center space-x-2 text-white shadow-lg transition-all"
                  >
                    <Play size={16} />
                    <span>Apri Lembo</span>
                  </button>
                )}

                {/* 2. Flap is open, waiting to reveal */}
                {animationStep === 'opened' && (
                  <button
                    onClick={() => onStepChange('revealed')}
                    className="px-6 py-2.5 bg-[#d4af37] text-slate-950 hover:bg-amber-300 font-bold font-sans rounded-full flex items-center space-x-2 shadow-lg transition-all animate-bounce"
                  >
                    <Eye size={16} />
                    <span>Rivela Contenuto</span>
                  </button>
                )}

                {/* 3. Revealed (Full Screen Sheet) - Game Master Options (Admin or User action) */}
                {animationStep === 'revealed' && (
                  <div className="flex gap-3 bg-slate-900/90 backdrop-blur-sm p-2 rounded-full border border-slate-700">
                    <button
                      onClick={() => onMarkAsOpened(envelope.id, true, envelope.points)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold font-sans text-sm rounded-full flex items-center space-x-1.5 shadow transition-all"
                    >
                      <Check size={16} />
                      <span>Sfida Superata (+{envelope.points})</span>
                    </button>
                    
                    <button
                      onClick={() => onMarkAsOpened(envelope.id, false, 0)}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold font-sans text-sm rounded-full flex items-center space-x-1.5 shadow transition-all"
                    >
                      <X size={16} />
                      <span>Sfida Fallita (0 pt)</span>
                    </button>
                  </div>
                )}

                {/* Close/Back Button */}
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold font-sans rounded-full flex items-center space-x-2 shadow transition-all"
                >
                  <X size={16} />
                  <span>Chiudi / Torna</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
