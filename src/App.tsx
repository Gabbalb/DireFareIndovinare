import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, VolumeX, Shield, Users, Mail, RotateCcw, 
  Plus, Trash2, Check, X, Tv, Settings, Sparkles, Edit2, RefreshCw, Award,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { useSyncState } from './hooks/useSyncState';
import { EnvelopeWidget } from './components/EnvelopeWidget';
import { type Team, type Envelope, type Category } from './utils/defaults';

function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');

  // Listen to routing hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync state across views
  const {
    teams,
    envelopes,
    categories,
    activeEnvelopeId,
    animationStep,
    isMuted,
    pointLevels,
    updateTeams,
    updateEnvelopes,
    updatePointLevels,
    updateCategories,
    openEnvelope,
    closeEnvelope,
    changeAnimationStep,
    toggleMute,
    triggerSound,
    resetAllGame
  } = useSyncState(route === '#/admin' ? 'admin' : 'public');

  // Handle marking an envelope as opened (giving or not points to team)
  const handleMarkAsOpened = (envelopeId: string, wasSuccessful: boolean, points: number, winningTeamId: string | null) => {
    const targetEnv = envelopes.find(e => e.id === envelopeId);
    if (!targetEnv) return;

    // 1. Give score to team if successful and winningTeamId is provided
    if (wasSuccessful && winningTeamId && points > 0) {
      const updatedTeams = teams.map(t => {
        if (t.id === winningTeamId) {
          return { ...t, score: t.score + points };
        }
        return t;
      });
      updateTeams(updatedTeams);
    }

    // 2. Mark envelope as opened
    const updatedEnvelopes = envelopes.map(e => {
      if (e.id === envelopeId) {
        return { ...e, isOpened: true };
      }
      return e;
    });
    updateEnvelopes(updatedEnvelopes);

    // 3. Close active envelope
    closeEnvelope();
  };

  // Render routing pages
  if (route === '#/admin') {
    return (
      <AdminPanel 
        teams={teams}
        envelopes={envelopes}
        categories={categories}
        activeEnvelopeId={activeEnvelopeId}
        animationStep={animationStep}
        isMuted={isMuted}
        pointLevels={pointLevels}
        updateTeams={updateTeams}
        updateEnvelopes={updateEnvelopes}
        updatePointLevels={updatePointLevels}
        updateCategories={updateCategories}
        openEnvelope={openEnvelope}
        closeEnvelope={closeEnvelope}
        changeAnimationStep={changeAnimationStep}
        toggleMute={toggleMute}
        triggerSound={triggerSound}
        resetAllGame={resetAllGame}
        handleMarkAsOpened={handleMarkAsOpened}
      />
    );
  }

  return (
    <PublicProjectionView 
      teams={teams}
      envelopes={envelopes}
      categories={categories}
      activeEnvelopeId={activeEnvelopeId}
      animationStep={animationStep}
      isMuted={isMuted}
      openEnvelope={openEnvelope}
      closeEnvelope={closeEnvelope}
      changeAnimationStep={changeAnimationStep}
      toggleMute={toggleMute}
      handleMarkAsOpened={handleMarkAsOpened}
    />
  );
}

// -------------------------------------------------------------
// 1. PUBLIC PROJECTION VIEW (CLIENT SCREEN)
// -------------------------------------------------------------
interface PublicProps {
  teams: Team[];
  envelopes: Envelope[];
  categories: Category[];
  activeEnvelopeId: string | null;
  animationStep: 'closed' | 'zoomed' | 'opened' | 'revealed';
  isMuted: boolean;
  openEnvelope: (id: string) => void;
  closeEnvelope: () => void;
  changeAnimationStep: (step: 'closed' | 'zoomed' | 'opened' | 'revealed') => void;
  toggleMute: () => void;
  handleMarkAsOpened: (id: string, success: boolean, points: number, winningTeamId: string | null) => void;
}

const PublicProjectionView: React.FC<PublicProps> = ({
  teams,
  envelopes,
  categories,
  activeEnvelopeId,
  animationStep,
  isMuted,
  openEnvelope,
  closeEnvelope,
  changeAnimationStep,
  toggleMute,
  handleMarkAsOpened
}) => {
  return (
    <div className="min-h-screen bg-bg-dark bg-grid-pattern relative flex flex-col text-slate-100 font-sans pb-10">
      
      {/* Glow Effects in background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Elegant Header */}
      <header className="relative w-full border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md px-6 py-4 flex justify-between items-center z-30 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-[#d4af37] flex items-center justify-center shadow-lg border border-amber-300/30">
            <Sparkles className="text-slate-950" size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 leading-none">
              DIREFARE SHOW
            </h1>
            <p className="text-[10px] md:text-xs font-bold tracking-widest text-indigo-400 uppercase mt-0.5">
              Il Gioco delle Buste a Squadre
            </p>
          </div>
        </div>

        {/* Global Sound and Action Toolbar */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleMute}
            className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
            title={isMuted ? "Attiva Audio" : "Disattiva Audio"}
          >
            {isMuted ? <VolumeX size={18} className="text-rose-400" /> : <Volume2 size={18} className="text-emerald-400" />}
          </button>
          
          <a 
            href="#/admin"
            className="hidden md:flex items-center space-x-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer"
          >
            <Settings size={14} />
            <span>CONSOLE REGIA</span>
          </a>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col justify-between">
        
        {/* Envelopes Grid Display sorted in vertical columns per category */}
        <div className="flex-1 flex flex-col justify-center my-6">
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8 items-start">
            {categories.map(cat => {
              const catEnvelopes = envelopes
                .filter(env => env.category === cat.key)
                .sort((a, b) => a.points - b.points);

              return (
                <div key={cat.key} className="w-full sm:w-[260px] md:w-[300px] lg:w-[320px] flex flex-col space-y-4 md:space-y-6">
                  {/* Column Header */}
                  <div 
                    className="text-center py-3 px-4 rounded-xl border font-bold text-sm md:text-base tracking-widest uppercase select-none shadow-md backdrop-blur-sm"
                    style={{
                      borderColor: `${cat.color}40`,
                      color: cat.color,
                      backgroundColor: `${cat.color}12`,
                      boxShadow: `0 4px 15px ${cat.color}08`
                    }}
                  >
                    {cat.name}
                  </div>

                  {/* Vertical Stack */}
                  <div className="flex flex-col space-y-4 lg:space-y-6">
                    {catEnvelopes.map((env, idx) => {
                      const isActive = activeEnvelopeId === env.id;
                      return (
                        <EnvelopeWidget
                          key={env.id}
                          envelope={env}
                          teams={teams}
                          categories={categories}
                          isActive={isActive}
                          animationStep={animationStep}
                          onOpen={() => openEnvelope(env.id)}
                          onStepChange={changeAnimationStep}
                          onClose={closeEnvelope}
                          onMarkAsOpened={handleMarkAsOpened}
                          role="public"
                          displayLabel={`${cat.name} ${idx + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Scoreboard Display */}
        <section className="mt-8 border border-slate-800/80 bg-slate-950/60 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-[#d4af37] to-pink-500" />
          <h2 className="text-center font-cinzel text-lg tracking-wider text-slate-300 mb-5 flex items-center justify-center gap-2">
            <Users size={18} className="text-indigo-400" />
            CLASSIFICA SQUADRE IN TEMPO REALE
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {teams.map((team, idx) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative overflow-hidden p-4 rounded-xl border bg-slate-900/40 flex items-center justify-between transition-all"
                style={{ borderColor: `${team.color}30` }}
              >
                <div 
                  className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-10 blur-xl"
                  style={{ backgroundColor: team.color }}
                />
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: team.color }} />
                  <span className="font-bold tracking-wide text-slate-200 text-sm md:text-base truncate max-w-[120px]">
                    {team.name}
                  </span>
                </div>
                <div className="text-right z-10">
                  <span className="text-xl md:text-2xl font-black text-slate-100 font-sans">
                    {team.score}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 block -mt-1">Punti</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* TV Screen Projection Tip Footer */}
      <footer className="w-full text-center text-slate-500 text-xs font-semibold border-t border-slate-900/80 pt-6 px-6 flex justify-between max-w-7xl mx-auto">
        <p>&copy; DireFare Show - Perfetto per proiettori / Smart TV</p>
        <p className="hidden md:block">Apri questa finestra a schermo intero (F11)</p>
      </footer>
    </div>
  );
};

// -------------------------------------------------------------
// 2. ADMIN CONTROL PANEL (SPECTACULAR BOARD MIRROR VERSION)
// -------------------------------------------------------------
interface AdminProps {
  teams: Team[];
  envelopes: Envelope[];
  categories: Category[];
  activeEnvelopeId: string | null;
  animationStep: 'closed' | 'zoomed' | 'opened' | 'revealed';
  isMuted: boolean;
  pointLevels: number[];
  updateTeams: (teams: Team[]) => void;
  updateEnvelopes: (envelopes: Envelope[]) => void;
  updatePointLevels: (levels: number[]) => void;
  updateCategories: (categories: Category[]) => void;
  openEnvelope: (id: string) => void;
  closeEnvelope: () => void;
  changeAnimationStep: (step: 'closed' | 'zoomed' | 'opened' | 'revealed') => void;
  toggleMute: () => void;
  triggerSound: (sound: 'zoom' | 'open' | 'reveal' | 'close') => void;
  resetAllGame: () => void;
  handleMarkAsOpened: (id: string, success: boolean, points: number, winningTeamId: string | null) => void;
}

const AdminPanel: React.FC<AdminProps> = ({
  teams,
  envelopes,
  categories,
  activeEnvelopeId,
  animationStep,
  isMuted,
  pointLevels,
  updateTeams,
  updateEnvelopes,
  updatePointLevels,
  updateCategories,
  openEnvelope,
  closeEnvelope,
  changeAnimationStep,
  toggleMute,
  triggerSound,
  resetAllGame,
  handleMarkAsOpened
}) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('direfare_admin_authed') === 'true';
  });
  const [pinError, setPinError] = useState(false);
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const [showAdminControllerTeamSelect, setShowAdminControllerTeamSelect] = useState(false);

  useEffect(() => {
    if (!activeEnvelopeId) {
      setShowAdminControllerTeamSelect(false);
    }
  }, [activeEnvelopeId]);

  // Modal open states
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isEnvelopeModalOpen, setIsEnvelopeModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (isCategoryModalOpen) {
      setLocalCategories(categories);
    }
  }, [isCategoryModalOpen, categories]);

  const handleLocalCategoryChange = (key: 'dire' | 'fare' | 'indovinare', field: 'name' | 'color', val: string) => {
    setLocalCategories(prev => prev.map(c => c.key === key ? { ...c, [field]: val } : c));
  };

  const saveCategoriesConfig = () => {
    updateCategories(localCategories);
    setIsCategoryModalOpen(false);
    alert("Colonne personalizzate salvate con successo!");
  };

  // Editing targets
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingEnvelopeId, setEditingEnvelopeId] = useState<string | null>(null);

  // Form Fields
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#3b82f6');

  const [envLabel, setEnvLabel] = useState('Busta');
  const [envPoints, setEnvPoints] = useState(100);
  const [envTitle, setEnvTitle] = useState('');
  const [envContent, setEnvContent] = useState('');
  const [envCategory, setEnvCategory] = useState<'dire' | 'fare' | 'indovinare'>('dire');

  const [localLevels, setLocalLevels] = useState<number[]>([]);
  const [newLevelPoints, setNewLevelPoints] = useState<number>(300);

  // Sync localLevels when modal opens or pointLevels changes
  useEffect(() => {
    if (isPointsModalOpen) {
      setLocalLevels(pointLevels);
    }
  }, [isPointsModalOpen, pointLevels]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
      localStorage.setItem('direfare_admin_authed', 'true');
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('direfare_admin_authed');
  };

  // CRUD handlers
  const saveTeam = () => {
    if (!teamName.trim()) return;
    if (editingTeamId) {
      updateTeams(teams.map(t => t.id === editingTeamId ? { ...t, name: teamName, color: teamColor } : t));
      setEditingTeamId(null);
    } else {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: teamName,
        color: teamColor,
        score: 0
      };
      updateTeams([...teams, newTeam]);
    }
    setTeamName('');
    setTeamColor('#3b82f6');
    setIsTeamModalOpen(false);
  };

  const startEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setTeamColor(team.color);
    setIsTeamModalOpen(true);
  };

  const removeTeam = (teamId: string) => {
    if (window.confirm("Rimuovendo questa squadra eliminerai i suoi punteggi. Continuare?")) {
      updateTeams(teams.filter(t => t.id !== teamId));
    }
  };

  const startAddTeam = () => {
    setEditingTeamId(null);
    setTeamName('');
    setTeamColor('#3b82f6');
    setIsTeamModalOpen(true);
  };

  const adjustScore = (teamId: string, amount: number) => {
    updateTeams(teams.map(t => t.id === teamId ? { ...t, score: Math.max(0, t.score + amount) } : t));
  };

  const saveEnvelope = () => {
    if (!envTitle.trim() || !envContent.trim()) return;

    if (editingEnvelopeId) {
      updateEnvelopes(envelopes.map(e => e.id === editingEnvelopeId ? {
        ...e,
        label: envLabel || e.label,
        points: envPoints,
        title: envTitle,
        content: envContent,
        category: envCategory
      } : e));
      setEditingEnvelopeId(null);
    } else {
      const sameCatEnvelopes = envelopes.filter(e => e.category === envCategory);
      const nextNumber = sameCatEnvelopes.length + 1;
      const finalLabel = envLabel && envLabel !== 'Busta' ? envLabel : `Busta ${nextNumber}`;

      const newEnv: Envelope = {
        id: `env-${Date.now()}`,
        label: finalLabel,
        points: envPoints,
        title: envTitle,
        content: envContent,
        category: envCategory,
        isOpened: false
      };
      updateEnvelopes([...envelopes, newEnv]);
    }

    setEnvTitle('');
    setEnvContent('');
    setEnvCategory('dire');
    setEnvLabel('Busta');
    setEnvPoints(100);
    setIsEnvelopeModalOpen(false);
  };

  const startEditEnvelope = (env: Envelope) => {
    setEditingEnvelopeId(env.id);
    setEnvLabel(env.label);
    setEnvPoints(env.points);
    setEnvTitle(env.title);
    setEnvContent(env.content);
    setEnvCategory(env.category);
    setIsEnvelopeModalOpen(true);
  };

  const startAddEnvelope = () => {
    setEditingEnvelopeId(null);
    setEnvLabel('Busta');
    setEnvPoints(100);
    setEnvTitle('');
    setEnvContent('');
    setEnvCategory('dire');
    setIsEnvelopeModalOpen(true);
  };

  const deleteEnvelope = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questa busta definitivamente?")) {
      updateEnvelopes(envelopes.filter(e => e.id !== id));
    }
  };

  const handleLocalLevelChange = (idx: number, val: number) => {
    const updated = [...localLevels];
    updated[idx] = val;
    setLocalLevels(updated);
  };

  const deleteLevelGlobally = (ptsValue: number) => {
    const confirmDel = window.confirm(`Sei sicuro di voler eliminare il livello da ${ptsValue} punti? Verranno eliminate le buste di questo valore per TUTTE le categorie!`);
    if (!confirmDel) return;

    const nextLevels = pointLevels.filter(p => p !== ptsValue);
    updatePointLevels(nextLevels);
    updateEnvelopes(envelopes.filter(e => e.points !== ptsValue));
    setLocalLevels(nextLevels);
    alert(`Livello da ${ptsValue} punti eliminato per tutte le categorie!`);
  };

  const addNewLevelGlobally = () => {
    if (!newLevelPoints || newLevelPoints <= 0) return;
    if (pointLevels.includes(newLevelPoints)) {
      alert("Questo livello esiste già!");
      return;
    }

    const nextLevels = [...pointLevels, newLevelPoints].sort((a, b) => a - b);
    updatePointLevels(nextLevels);

    // Create a new envelope of this point value for each category
    const newEnvs = [...envelopes];
    ['dire', 'fare', 'indovinare'].forEach(cat => {
      newEnvs.push({
        id: `env-${cat}-${newLevelPoints}-${Date.now()}`,
        category: cat as 'dire' | 'fare' | 'indovinare',
        label: `Busta`,
        points: newLevelPoints,
        title: `Sfida ${cat.toUpperCase()} da ${newLevelPoints} Punti`,
        content: `Istruzioni per la sfida da ${newLevelPoints} punti della categoria ${cat.toUpperCase()}. Clicca per personalizzare!`,
        isOpened: false
      });
    });
    updateEnvelopes(newEnvs);
    setLocalLevels(nextLevels);
    alert(`Livello da ${newLevelPoints} punti aggiunto per tutte le categorie!`);
  };

  const savePointsConfig = () => {
    const uniqueLevels = Array.from(new Set(localLevels.map(p => Number(p)).filter(p => !isNaN(p) && p > 0))).sort((a, b) => a - b);
    if (uniqueLevels.length === 0) {
      alert("Inserisci almeno un livello valido!");
      return;
    }

    // Update envelopes points if levels changed in place
    const updatedEnvelopes = envelopes.map(env => {
      // Find if this envelope's points match an old level that got changed
      const levelIdx = pointLevels.indexOf(env.points);
      if (levelIdx !== -1 && uniqueLevels[levelIdx] !== undefined) {
        const newPts = uniqueLevels[levelIdx];
        if (newPts !== env.points) {
          const oldTitle = `Sfida da ${env.points} Punti`;
          const newTitle = env.title === oldTitle ? `Sfida da ${newPts} Punti` : env.title;
          return { ...env, points: newPts, title: newTitle };
        }
      }
      return env;
    });

    updatePointLevels(uniqueLevels);
    updateEnvelopes(updatedEnvelopes);
    setIsPointsModalOpen(false);
    alert("Livelli di punteggio aggiornati con successo!");
  };

  const regenerateEnvelopesWithPoints = () => {
    const uniqueLevels = Array.from(new Set(localLevels.map(p => Number(p)).filter(p => !isNaN(p) && p > 0))).sort((a, b) => a - b);
    if (uniqueLevels.length === 0) {
      alert("Inserisci livelli di punteggio validi prima di rigenerare!");
      return;
    }

    const confirmGen = window.confirm("Questo cancellerà TUTTE le buste esistenti e creerà nuove buste vuote per ciascuna categoria con i livelli di punteggio indicati (" + uniqueLevels.join(', ') + "). Continuare?");
    if (!confirmGen) return;

    updatePointLevels(uniqueLevels);

    const newEnvelopes: Envelope[] = [];
    ['dire', 'fare', 'indovinare'].forEach(cat => {
      uniqueLevels.forEach((pts, idx) => {
        newEnvelopes.push({
          id: `env-${cat}-${pts}-${idx}-${Date.now()}`,
          category: cat as 'dire' | 'fare' | 'indovinare',
          label: `Busta ${idx + 1}`,
          points: pts,
          title: `Sfida ${cat.toUpperCase()} da ${pts} Punti`,
          content: `Istruzioni per la sfida da ${pts} punti della categoria ${cat.toUpperCase()}. Fai clic sulla penna a destra per personalizzare questa sfida!`,
          isOpened: false
        });
      });
    });
    updateEnvelopes(newEnvelopes);
    setIsPointsModalOpen(false);
    alert("Griglia di buste rigenerata correttamente con i nuovi punteggi!");
  };

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center"
        >
          <div className="mx-auto w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-4">
            <Shield size={24} />
          </div>
          <h1 className="font-cinzel text-xl font-bold text-slate-100 tracking-wider mb-2">
            DIREFARE - ADMIN ACCESS
          </h1>
          <p className="text-xs text-slate-400 mb-6 font-sans">
            Inserisci il codice di sicurezza per controllare il tabellone di gioco
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Inserisci PIN (Default: 1234)"
              className="w-full text-center px-4 py-3 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 tracking-widest text-lg font-sans placeholder:tracking-normal placeholder:text-sm"
              autoFocus
            />
            {pinError && (
              <p className="text-xs font-semibold text-rose-400 animate-shake">
                Codice non corretto! Riprova.
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg"
            >
              Accedi al Pannello
            </button>
          </form>

          <a href="#/" className="inline-block mt-6 text-xs text-slate-500 hover:text-slate-400 font-semibold transition-all">
            &larr; Torna alla Schermata Pubblica
          </a>
        </motion.div>
      </div>
    );
  }

  // Active projection card helpers
  const activeEnvelope = envelopes.find(e => e.id === activeEnvelopeId);

  return (
    <div className="min-h-screen bg-bg-dark bg-grid-pattern relative flex flex-col text-slate-100 font-sans pb-28">
      
      {/* Header (Mirroring public screen but customized for admin) */}
      <header className="relative w-full border-b border-slate-900 bg-slate-950/60 backdrop-blur-md px-6 py-3 flex justify-between items-center z-30 shadow-lg">
        <div className="flex items-center space-x-3">
          <Settings className="text-indigo-400 animate-spin-slow" size={22} />
          <div>
            <h1 className="text-xl md:text-2xl font-black font-cinzel text-slate-100 leading-none">
              DIREFARE - CONSOLE REGIA
            </h1>
            <p className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mt-0.5">
              Controllo speculare del tabellone proiettato
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a 
            href="#/" 
            target="_blank" 
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 rounded-full text-xs font-bold transition-all shadow"
          >
            <Tv size={13} />
            <span>APRI SCHERMO PUBBLICO</span>
          </a>
          <button 
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white rounded-full text-xs font-semibold cursor-pointer transition-all"
          >
            Esci
          </button>
        </div>
      </header>

      {/* Main Specular Columns Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col justify-between">
        
        {/* Specular centered columns board */}
        <div className="flex-1 flex flex-col justify-center my-4">
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8 items-start">
            {categories.map(cat => {
              const catEnvelopes = envelopes
                .filter(env => env.category === cat.key)
                .sort((a, b) => a.points - b.points);

              return (
                <div key={cat.key} className="w-full sm:w-[260px] md:w-[300px] lg:w-[320px] flex flex-col space-y-4 md:space-y-6">
                  {/* Column Header */}
                  <div 
                    className="relative group text-center py-3 px-4 rounded-xl border font-bold text-sm md:text-base tracking-widest uppercase select-none shadow-md backdrop-blur-sm"
                    style={{
                      borderColor: `${cat.color}40`,
                      color: cat.color,
                      backgroundColor: `${cat.color}12`,
                      boxShadow: `0 4px 15px ${cat.color}08`
                    }}
                  >
                    <span>{cat.name}</span>
                  </div>

                  {/* Vertical stack with edit and delete controls overlaid */}
                  <div className="flex flex-col space-y-4 lg:space-y-6">
                    {catEnvelopes.map((env, idx) => {
                      const catColor = cat.color;
                      
                      return (
                        <div key={env.id} className="relative group">
                          
                          {/* Outer standard card */}
                          <div
                            className={`relative w-full aspect-[3/2] rounded-xl overflow-hidden shadow border transition-all duration-300 ${
                              env.isOpened 
                                ? 'opacity-40 grayscale border-slate-700 bg-slate-900/50' 
                                : 'border-white/10'
                            }`}
                            style={{
                              backgroundColor: env.isOpened ? '#121420' : catColor,
                              boxShadow: !env.isOpened ? `0 6px 20px ${catColor}20, inset 0 1.5px 3px rgba(255,255,255,0.2)` : 'none',
                            }}
                          >
                            {/* Graphic visual shading */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/50 pointer-events-none" />
                            
                            <div className="absolute inset-x-0 top-0 h-1/2"
                              style={{
                                clipPath: 'polygon(0% 0%, 50% 60%, 100% 0%)',
                                background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
                              }}
                            />
                            
                            {/* Inner content */}
                            <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                              <div className="text-center w-full flex justify-center items-center">
                                <div className={`flex items-center space-x-1 ${env.isOpened ? 'text-slate-500' : 'text-amber-100 bg-black/20 px-2.5 py-0.5 rounded-full border border-amber-300/10'}`}>
                                  <Award size={12} />
                                  <span className="text-[10px] md:text-xs font-black tracking-wider">{cat.name} {idx + 1} &bull; {env.points} PT</span>
                                </div>
                              </div>
                              <div className="h-4 pointer-events-none" />
                              <div className={`flex justify-center items-center text-[10px] border-t pt-2 ${
                                env.isOpened ? 'text-slate-500 border-slate-800/80' : 'text-white/80 border-white/15'
                              }`}>
                                <h3 className="font-bold tracking-wide truncate">{env.isOpened ? 'GIÀ APERTA' : 'DISPONIBILE'}</h3>
                              </div>
                            </div>

                            {/* Seal */}
                            {!env.isOpened && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center border"
                                  style={{
                                    background: `radial-gradient(circle, #fbe7a1 0%, #d4af37 60%, #a27a0d 100%)`,
                                    borderColor: '#ffffff50',
                                  }}
                                >
                                  <Mail size={12} className="text-slate-950" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Hover Admin Actions Panel overlay */}
                          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2.5 transition-all duration-200 z-30 p-2">
                            <button
                              onClick={() => openEnvelope(env.id)}
                              disabled={env.isOpened}
                              className="p-2 bg-indigo-600 disabled:opacity-40 hover:bg-indigo-500 text-white rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                              title="Proietta / Apri Busta"
                            >
                              <Tv size={15} />
                            </button>
                            <button
                              onClick={() => startEditEnvelope(env)}
                              className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                              title="Modifica Contenuto"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => deleteEnvelope(env.id)}
                              className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                              title="Elimina Busta"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Centered Active Envelope Controller Overlay (If an envelope is proiettato) */}
        {activeEnvelope && (
          <div className="border border-slate-800 bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 shadow-2xl relative overflow-hidden mt-6 mb-2">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-indigo-500" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-[#d4af37]">
                  <span className="px-2 py-0.5 bg-slate-950 rounded border border-amber-300/10">SCHERMO ATTIVO</span>
                  <span>&bull;</span>
                  <span className="uppercase">{activeEnvelope.category}</span>
                  <span>&bull;</span>
                  <span>{activeEnvelope.points} PUNTI</span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-1">{activeEnvelope.title}</h3>
                <p className="text-xs text-slate-400 italic mt-0.5 truncate max-w-2xl">"{activeEnvelope.content}"</p>
              </div>

              {/* Step triggers */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button 
                  onClick={() => changeAnimationStep('zoomed')}
                  className={`py-1.5 px-3 rounded-full font-bold transition-all ${animationStep === 'zoomed' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800'}`}
                >
                  1. Zoom Busta
                </button>
                <button 
                  onClick={() => changeAnimationStep('opened')}
                  className={`py-1.5 px-3 rounded-full font-bold transition-all ${animationStep === 'opened' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800'}`}
                >
                  2. Apri
                </button>
                <button 
                  onClick={() => changeAnimationStep('revealed')}
                  className={`py-1.5 px-3 rounded-full font-bold transition-all ${animationStep === 'revealed' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800'}`}
                >
                  3. Rivela Carta
                </button>

                <div className="h-6 w-px bg-slate-800 mx-1" />

                {!showAdminControllerTeamSelect ? (
                  <>
                    <button
                      onClick={() => setShowAdminControllerTeamSelect(true)}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-full text-white flex items-center gap-1 shadow cursor-pointer"
                    >
                      <Check size={12} />
                      <span>Superata</span>
                    </button>
                    <button
                      onClick={() => handleMarkAsOpened(activeEnvelope.id, false, 0, null)}
                      className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 font-bold rounded-full text-white flex items-center gap-1 shadow cursor-pointer"
                    >
                      <X size={12} />
                      <span>Fallita</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-full border border-slate-850">
                    <span className="text-[9px] font-bold text-slate-400 px-2 uppercase">Assegna punti a:</span>
                    {teams.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          handleMarkAsOpened(activeEnvelope.id, true, activeEnvelope.points, t.id);
                          setShowAdminControllerTeamSelect(false);
                        }}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white transition-all shadow hover:brightness-110"
                        style={{ backgroundColor: t.color }}
                      >
                        {t.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowAdminControllerTeamSelect(false)}
                      className="px-2 text-[10px] text-slate-500 hover:text-slate-450 font-bold"
                    >
                      X
                    </button>
                  </div>
                )}
                
                <button
                  onClick={closeEnvelope}
                  className="py-1.5 px-3 bg-slate-950 hover:bg-slate-850 text-slate-450 border border-slate-800 rounded-full transition-all cursor-pointer"
                  title="Chiudi"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* -------------------------------------------------------------
          3. STICKY BOTTOM CONTROL BAR
      ------------------------------------------------------------- */}
      <footer className="fixed bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-800/80 p-3 md:p-4 z-40 backdrop-blur-md shadow-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          
          {/* Main Top Line of Footer */}
          <div className="flex justify-between items-center gap-3">
            {/* Left: Scores adjustments list */}
            <div className="flex-1 flex items-center space-x-3 overflow-x-auto py-1 scrollbar-thin">
              <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase select-none shrink-0">SCOREBOARD:</span>
              {teams.map(team => (
                <div key={team.id} className="flex items-center space-x-1 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-full text-xs shrink-0">
                  <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: team.color }} />
                  <span className="font-bold text-slate-300 mr-1 truncate max-w-[70px]">{team.name}:</span>
                  <button 
                    onClick={() => adjustScore(team.id, -50)} 
                    className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-bold rounded hover:bg-slate-800"
                  >
                    -50
                  </button>
                  <span className="font-mono font-black text-slate-100 px-1">{team.score}</span>
                  <button 
                    onClick={() => adjustScore(team.id, 50)} 
                    className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-bold rounded hover:bg-slate-800"
                  >
                    +50
                  </button>
                  <button
                    onClick={() => startEditTeam(team)}
                    className="p-1 rounded text-slate-450 hover:text-indigo-400 transition-colors ml-1"
                    title="Modifica Squadra"
                  >
                    <Edit2 size={10} />
                  </button>
                  <button
                    onClick={() => removeTeam(team.id)}
                    className="p-1 rounded text-slate-450 hover:text-rose-450 transition-colors"
                    title="Elimina Squadra"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
              <button
                onClick={startAddTeam}
                className="p-1 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white transition-all cursor-pointer shrink-0"
                title="Aggiungi Nuova Squadra"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Mobile Expand / Collapse Controls Toggler */}
            <div className="flex items-center space-x-2 shrink-0 md:hidden">
              <button 
                onClick={() => setIsFooterExpanded(!isFooterExpanded)}
                className="p-2 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 transition-all font-semibold text-xs flex items-center gap-1 shadow-md cursor-pointer"
              >
                <span>Console</span>
                {isFooterExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            </div>
          </div>

          {/* Expanded Tools Panel: Visible on desktop, and collapsible on mobile */}
          <div className={`${isFooterExpanded ? 'flex' : 'hidden'} md:flex flex-col md:flex-row justify-between items-center gap-4 pt-2 md:pt-0 border-t border-slate-800/40 md:border-none`}>
            {/* Center: Global Actions */}
            <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-start gap-2">
              <button
                onClick={startAddEnvelope}
                className="flex-1 md:flex-none px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all shadow"
              >
                <Plus size={13} />
                <span>Nuova Busta</span>
              </button>
              
              <button
                onClick={() => setIsPointsModalOpen(true)}
                className="flex-1 md:flex-none px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-full text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <RefreshCw size={12} />
                <span>Punteggi Griglia</span>
              </button>

              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex-1 md:flex-none px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-full text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <Settings size={12} />
                <span>Personalizza Colonne</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Sei sicuro di voler resettare tutte le buste (renderle chiuse) e azzerare i punteggi delle squadre?")) {
                    resetAllGame();
                  }
                }}
                className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-300 hover:text-rose-100 rounded-full text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <RotateCcw size={12} />
                <span>Reset Partita</span>
              </button>
            </div>

            {/* Right: Sound effects cue deck */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
              <div className="flex-1 md:flex-none flex items-center justify-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-850 text-xs">
                <span className="text-[9px] font-bold text-slate-500 select-none uppercase">EFFETTI:</span>
                <button 
                  onClick={() => triggerSound('zoom')}
                  className="px-1.5 py-0.5 bg-slate-950 text-slate-400 hover:text-slate-200 rounded text-[10px] font-semibold border border-slate-800"
                >
                  Zoom
                </button>
                <button 
                  onClick={() => triggerSound('open')}
                  className="px-1.5 py-0.5 bg-slate-950 text-slate-400 hover:text-slate-200 rounded text-[10px] font-semibold border border-slate-800"
                >
                  Strappo
                </button>
                <button 
                  onClick={() => triggerSound('reveal')}
                  className="px-1.5 py-0.5 bg-slate-950 text-amber-400 hover:text-amber-300 rounded text-[10px] font-semibold border border-amber-500/10"
                >
                  Triumph
                </button>
                <button 
                  onClick={() => triggerSound('close')}
                  className="px-1.5 py-0.5 bg-slate-950 text-slate-400 hover:text-slate-200 rounded text-[10px] font-semibold border border-slate-800"
                >
                  Swoosh
                </button>
              </div>
              <button 
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 transition-all cursor-pointer"
              >
                {isMuted ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-emerald-450" />}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* -------------------------------------------------------------
          4. OVERLAY EDIT MODALS
      ------------------------------------------------------------- */}
      
      {/* A. SQUADRA EDIT MODAL */}
      <AnimatePresence>
        {isTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsTeamModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 text-slate-100"
            >
              <h3 className="font-cinzel text-lg font-bold tracking-wider text-slate-100 border-b border-slate-800 pb-3 mb-4">
                {editingTeamId ? 'MODIFICA SQUADRA' : 'AGGIUNGI NUOVA SQUADRA'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Nome Squadra</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Es. Squadra Rossa"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 font-sans"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Colore Identificativo</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={teamColor}
                      onChange={(e) => setTeamColor(e.target.value)}
                      className="w-12 h-10 px-1 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={teamColor}
                      onChange={(e) => setTeamColor(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 border-t border-slate-800 pt-4">
                <button
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  onClick={saveTeam}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1 shadow-md"
                >
                  <Check size={14} />
                  <span>Salva</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. BUSTA EDIT MODAL */}
      <AnimatePresence>
        {isEnvelopeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsEnvelopeModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 text-slate-100"
            >
              <h3 className="font-cinzel text-lg font-bold tracking-wider text-slate-100 border-b border-slate-800 pb-3 mb-4">
                {editingEnvelopeId ? 'MODIFICA BUSTA SFIDA' : 'CREA NUOVA BUSTA SFIDA'}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Etichetta Busta</label>
                    <input
                      type="text"
                      value={envLabel}
                      onChange={(e) => setEnvLabel(e.target.value)}
                      placeholder="Busta X"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Punteggio Sfida</label>
                    <input
                      type="number"
                      value={envPoints}
                      onChange={(e) => setEnvPoints(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Categoria</label>
                  <select
                    value={envCategory}
                    onChange={(e) => setEnvCategory(e.target.value as 'dire' | 'fare' | 'indovinare')}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-xs text-slate-300"
                  >
                    <option value="dire">Dire</option>
                    <option value="fare">Fare</option>
                    <option value="indovinare">Indovinare</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Titolo Sfida / Tipo</label>
                  <input
                    type="text"
                    value={envTitle}
                    onChange={(e) => setEnvTitle(e.target.value)}
                    placeholder="Es. FARE - Equilibrio Estremo"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Istruzioni Sfida (Contenuto Interno)</label>
                  <textarea
                    value={envContent}
                    onChange={(e) => setEnvContent(e.target.value)}
                    placeholder="Scrivi qui cosa deve fare la squadra..."
                    className="w-full h-24 px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-xs text-slate-250 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 border-t border-slate-800 pt-4">
                <button
                  onClick={() => setIsEnvelopeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  onClick={saveEnvelope}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1 shadow-md"
                >
                  <Check size={14} />
                  <span>Salva Busta</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. PUNTEGGI / GENERATORE EDIT MODAL */}
      <AnimatePresence>
        {isPointsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsPointsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 text-slate-100"
            >
              <h3 className="font-cinzel text-lg font-bold tracking-wider text-slate-100 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                <RefreshCw size={18} className="text-indigo-400" />
                LIVELLI E GRIGLIA SFIDE
              </h3>
              
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">
                    Livelli Punteggio Attivi (Modifica o Elimina Riga)
                  </label>
                  {localLevels.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">Nessun livello impostato.</p>
                  ) : (
                    localLevels.map((pts, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono w-6">#{idx + 1}</span>
                        <input
                          type="number"
                          value={pts}
                          onChange={(e) => handleLocalLevelChange(idx, Number(e.target.value))}
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 text-xs font-mono"
                        />
                        <button
                          onClick={() => deleteLevelGlobally(pts)}
                          className="p-1.5 bg-rose-950/20 text-rose-400 border border-rose-900/30 hover:bg-rose-900/40 rounded-xl cursor-pointer transition-all"
                          title="Elimina questo livello per tutte le squadre"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add new Level inline block */}
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850/85 space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold block">
                    Aggiungi Nuovo Livello (Riga)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newLevelPoints}
                      onChange={(e) => setNewLevelPoints(Number(e.target.value))}
                      placeholder="Punti (es. 300)"
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-250 text-xs font-mono"
                    />
                    <button
                      onClick={addNewLevelGlobally}
                      className="px-3.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus size={13} />
                      <span>Aggiungi</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-6 border-t border-slate-800 pt-4">
                <div className="flex justify-between gap-2.5">
                  <button
                    onClick={() => setIsPointsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-450 font-semibold rounded-xl text-xs cursor-pointer flex-1"
                  >
                    Chiudi
                  </button>
                  <button
                    onClick={savePointsConfig}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer flex-1 flex items-center justify-center gap-1 shadow"
                  >
                    <Check size={13} />
                    <span>Salva Livelli</span>
                  </button>
                </div>

                <div className="h-px bg-slate-800 my-2" />

                <button
                  onClick={regenerateEnvelopesWithPoints}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-lg transition-transform active:scale-98 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>RIGENERA INTERA GRIGLIA BUSTE</span>
                </button>
                <p className="text-[8.5px] text-slate-500 leading-normal text-center">
                  ⚠️ Attenzione: "Rigenera Intera Griglia" eliminerà TUTTI i testi correnti e creerà un tabellone vuoto pulito per ciascuna squadra.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. PERSONALIZZA COLONNE / CATEGORIE MODAL */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 text-slate-100"
            >
              <h3 className="font-cinzel text-lg font-bold tracking-wider text-slate-100 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                <Settings size={18} className="text-indigo-400" />
                PERSONALIZZA COLONNE
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {localCategories.map((cat) => (
                  <div key={cat.key} className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Colonna {cat.key === 'dire' ? '1' : cat.key === 'fare' ? '2' : '3'} (Key: {cat.key})
                    </span>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold block mb-1">Nome Colonna</label>
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => handleLocalCategoryChange(cat.key, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold block mb-1">Colore Colonna</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={cat.color}
                            onChange={(e) => handleLocalCategoryChange(cat.key, 'color', e.target.value)}
                            className="w-10 h-8 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer"
                          />
                          <input
                            type="text"
                            value={cat.color}
                            onChange={(e) => handleLocalCategoryChange(cat.key, 'color', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-300 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2.5 mt-6 border-t border-slate-800 pt-4">
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-450 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  onClick={saveCategoriesConfig}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1 shadow-md"
                >
                  <Check size={14} />
                  <span>Salva Colonne</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default App;
