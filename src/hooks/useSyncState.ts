import { useState, useEffect, useRef } from 'react';
import { type Team, type Envelope, type Category, DEFAULT_TEAMS, DEFAULT_ENVELOPES, DEFAULT_CATEGORIES } from '../utils/defaults';
import { playSound } from '../utils/audio';

export interface GameState {
  teams: Team[];
  envelopes: Envelope[];
  activeEnvelopeId: string | null;
  animationStep: 'closed' | 'zoomed' | 'opened' | 'photo' | 'revealed';
  isMuted: boolean;
  pointLevels: number[];
}

export function useSyncState(_role: 'public' | 'admin') {
  // Load initial state from local storage or defaults
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('direfare_teams');
    return saved ? JSON.parse(saved) : DEFAULT_TEAMS;
  });

  const [envelopes, setEnvelopes] = useState<Envelope[]>(() => {
    const saved = localStorage.getItem('direfare_envelopes');
    if (!saved) return DEFAULT_ENVELOPES;
    try {
      const parsed = JSON.parse(saved) as any[];
      const needMigration = parsed.length > 0 && !parsed[0].category;
      if (needMigration) {
        return parsed.map((env, idx) => {
          let category: 'dire' | 'fare' | 'indovinare' = 'dire';
          if (env.teamId === 'team-blue' || env.teamId === 'team-green') {
            category = 'fare';
          } else if (env.teamId === 'team-yellow') {
            category = 'indovinare';
          } else {
            const catKeys: ('dire' | 'fare' | 'indovinare')[] = ['dire', 'fare', 'indovinare'];
            category = catKeys[idx % 3];
          }
          return {
            id: env.id,
            category,
            label: env.label || `Busta ${idx + 1}`,
            points: env.points || 100,
            title: env.title || 'Sfida',
            content: env.content || '',
            isOpened: env.isOpened || false
          };
        });
      }
      return parsed;
    } catch (e) {
      return DEFAULT_ENVELOPES;
    }
  });

  const [activeEnvelopeId, setActiveEnvelopeId] = useState<string | null>(() => {
    return localStorage.getItem('direfare_active_envelope');
  });

  const [animationStep, setAnimationStep] = useState<'closed' | 'zoomed' | 'opened' | 'photo' | 'revealed'>(() => {
    return (localStorage.getItem('direfare_animation_step') as any) || 'closed';
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('direfare_muted');
    return saved ? JSON.parse(saved) : false;
  });

  const [pointLevels, setPointLevels] = useState<number[]>(() => {
    const saved = localStorage.getItem('direfare_point_levels');
    return saved ? JSON.parse(saved) : [100, 150, 200, 250];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('direfare_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  // Timer states
  const [timerActive, setTimerActive] = useState<boolean>(() => {
    return localStorage.getItem('direfare_timer_active') === 'true';
  });
  const [timerDuration, setTimerDuration] = useState<number>(() => {
    const saved = localStorage.getItem('direfare_timer_duration');
    return saved ? parseInt(saved, 10) : 30;
  });
  const [timerTimeLeft, setTimerTimeLeft] = useState<number>(() => {
    const saved = localStorage.getItem('direfare_timer_timeleft');
    return saved ? parseInt(saved, 10) : 30;
  });
  const [timerIsPaused, setTimerIsPaused] = useState<boolean>(() => {
    return localStorage.getItem('direfare_timer_paused') === 'true';
  });

  // Reference for BroadcastChannel
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('direfare-game-sync');
    channelRef.current = channel;

    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'SYNC_STATE':
          if (payload.teams) setTeams(payload.teams);
          if (payload.envelopes) setEnvelopes(payload.envelopes);
          if (payload.activeEnvelopeId !== undefined) setActiveEnvelopeId(payload.activeEnvelopeId);
          if (payload.animationStep !== undefined) setAnimationStep(payload.animationStep);
          if (payload.pointLevels) setPointLevels(payload.pointLevels);
          if (payload.categories) setCategories(payload.categories);
          if (payload.timerActive !== undefined) setTimerActive(payload.timerActive);
          if (payload.timerDuration !== undefined) setTimerDuration(payload.timerDuration);
          if (payload.timerTimeLeft !== undefined) setTimerTimeLeft(payload.timerTimeLeft);
          if (payload.timerIsPaused !== undefined) setTimerIsPaused(payload.timerIsPaused);
          break;

        case 'TRIGGER_OPEN_ENVELOPE':
          setActiveEnvelopeId(payload.id);
          setAnimationStep('revealed');
          playSound.reveal(isMuted);
          break;

        case 'TRIGGER_STEP':
          setAnimationStep(payload.step);
          if (payload.step === 'opened') {
            playSound.open(isMuted);
          } else if (payload.step === 'revealed') {
            playSound.reveal(isMuted);
          } else if (payload.step === 'closed') {
            playSound.close(isMuted);
            setActiveEnvelopeId(null);
          }
          break;

        case 'TRIGGER_CLOSE':
          setAnimationStep('closed');
          setActiveEnvelopeId(null);
          playSound.close(isMuted);
          break;

        case 'PLAY_SOUND_EFFECT':
          if (payload.sound && playSound[payload.sound as keyof typeof playSound]) {
            (playSound[payload.sound as keyof typeof playSound] as any)(isMuted);
          }
          break;
          
        case 'TOGGLE_MUTE':
          setIsMuted(payload.muted);
          break;

        case 'SYNC_TIMER':
          if (payload.active !== undefined) setTimerActive(payload.active);
          if (payload.duration !== undefined) setTimerDuration(payload.duration);
          if (payload.timeLeft !== undefined) setTimerTimeLeft(payload.timeLeft);
          if (payload.isPaused !== undefined) setTimerIsPaused(payload.isPaused);
          break;
      }
    };

    channel.addEventListener('message', handleMessage);

    // Sync from LocalStorage when other tabs make modifications
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'direfare_teams' && e.newValue) {
        setTeams(JSON.parse(e.newValue));
      }
      if (e.key === 'direfare_envelopes' && e.newValue) {
        setEnvelopes(JSON.parse(e.newValue));
      }
      if (e.key === 'direfare_active_envelope') {
        setActiveEnvelopeId(e.newValue);
      }
      if (e.key === 'direfare_animation_step') {
        setAnimationStep((e.newValue as any) || 'closed');
      }
      if (e.key === 'direfare_muted' && e.newValue) {
        setIsMuted(JSON.parse(e.newValue));
      }
      if (e.key === 'direfare_point_levels' && e.newValue) {
        setPointLevels(JSON.parse(e.newValue));
      }
      if (e.key === 'direfare_categories' && e.newValue) {
        setCategories(JSON.parse(e.newValue));
      }
      if (e.key === 'direfare_timer_active' && e.newValue) {
        setTimerActive(e.newValue === 'true');
      }
      if (e.key === 'direfare_timer_duration' && e.newValue) {
        setTimerDuration(parseInt(e.newValue, 10));
      }
      if (e.key === 'direfare_timer_timeleft' && e.newValue) {
        setTimerTimeLeft(parseInt(e.newValue, 10));
      }
      if (e.key === 'direfare_timer_paused' && e.newValue) {
        setTimerIsPaused(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isMuted]);

  // Admin Countdown Tick Effect
  useEffect(() => {
    if (_role !== 'admin') return;
    if (!timerActive || timerIsPaused) return;

    const interval = setInterval(() => {
      setTimerTimeLeft(prev => {
        const next = prev - 1;
        
        localStorage.setItem('direfare_timer_timeleft', next.toString());
        
        if (next <= 0) {
          clearInterval(interval);
          setTimerActive(false);
          localStorage.setItem('direfare_timer_active', 'false');
          
          // play buzzer
          playSound.buzzer(isMuted);
          
          channelRef.current?.postMessage({
            type: 'SYNC_TIMER',
            payload: { active: false, timeLeft: 0 }
          });
          
          channelRef.current?.postMessage({
            type: 'PLAY_SOUND_EFFECT',
            payload: { sound: 'buzzer' }
          });
          
          return 0;
        }

        // Play tick sound
        playSound.tick(isMuted);
        channelRef.current?.postMessage({
          type: 'PLAY_SOUND_EFFECT',
          payload: { sound: 'tick' }
        });

        channelRef.current?.postMessage({
          type: 'SYNC_TIMER',
          payload: { timeLeft: next }
        });
        
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timerIsPaused, isMuted, _role]);

  // Save updates to localStorage and broadcast to other tabs
  const updateTeams = (newTeams: Team[]) => {
    setTeams(newTeams);
    localStorage.setItem('direfare_teams', JSON.stringify(newTeams));
    channelRef.current?.postMessage({
      type: 'SYNC_STATE',
      payload: { teams: newTeams }
    });
  };

  const updateEnvelopes = (newEnvelopes: Envelope[]) => {
    setEnvelopes(newEnvelopes);
    localStorage.setItem('direfare_envelopes', JSON.stringify(newEnvelopes));
    channelRef.current?.postMessage({
      type: 'SYNC_STATE',
      payload: { envelopes: newEnvelopes }
    });
  };

  const updatePointLevels = (newLevels: number[]) => {
    setPointLevels(newLevels);
    localStorage.setItem('direfare_point_levels', JSON.stringify(newLevels));
    channelRef.current?.postMessage({
      type: 'SYNC_STATE',
      payload: { pointLevels: newLevels }
    });
  };

  const updateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem('direfare_categories', JSON.stringify(newCategories));
    channelRef.current?.postMessage({
      type: 'SYNC_STATE',
      payload: { categories: newCategories }
    });
  };

  const openEnvelope = (id: string) => {
    setActiveEnvelopeId(id);
    setAnimationStep('revealed');
    localStorage.setItem('direfare_active_envelope', id);
    localStorage.setItem('direfare_animation_step', 'revealed');
    
    // Broadcast action
    channelRef.current?.postMessage({
      type: 'TRIGGER_OPEN_ENVELOPE',
      payload: { id }
    });
    playSound.reveal(isMuted);
  };

  const changeAnimationStep = (step: 'closed' | 'zoomed' | 'opened' | 'photo' | 'revealed') => {
    setAnimationStep(step);
    localStorage.setItem('direfare_animation_step', step);
    
    if (step === 'closed') {
      setActiveEnvelopeId(null);
      localStorage.removeItem('direfare_active_envelope');
    }

    channelRef.current?.postMessage({
      type: 'TRIGGER_STEP',
      payload: { step }
    });

    // Play corresponding sound
    if (step === 'opened') {
      playSound.open(isMuted);
    } else if (step === 'revealed') {
      playSound.reveal(isMuted);
    } else if (step === 'closed') {
      playSound.close(isMuted);
    }
  };

  const closeEnvelope = () => {
    setActiveEnvelopeId(null);
    setAnimationStep('closed');
    localStorage.removeItem('direfare_active_envelope');
    localStorage.setItem('direfare_animation_step', 'closed');

    channelRef.current?.postMessage({
      type: 'TRIGGER_CLOSE',
      payload: {}
    });
    playSound.close(isMuted);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('direfare_muted', JSON.stringify(nextMuted));
    channelRef.current?.postMessage({
      type: 'TOGGLE_MUTE',
      payload: { muted: nextMuted }
    });
  };

  const triggerSound = (soundType: 'zoom' | 'open' | 'reveal' | 'close' | 'tick' | 'buzzer') => {
    channelRef.current?.postMessage({
      type: 'PLAY_SOUND_EFFECT',
      payload: { sound: soundType }
    });
    playSound[soundType](isMuted);
  };

  const resetAllGame = () => {
    const resetEnvelopes = envelopes.map(env => ({ ...env, isOpened: false }));
    updateEnvelopes(resetEnvelopes);
    
    // Optional: Reset scores to 0
    const resetTeams = teams.map(t => ({ ...t, score: 0 }));
    updateTeams(resetTeams);

    closeEnvelope();
    stopTimer();
  };

  const startTimer = (duration: number) => {
    setTimerDuration(duration);
    setTimerTimeLeft(duration);
    setTimerActive(true);
    setTimerIsPaused(false);
    
    localStorage.setItem('direfare_timer_duration', duration.toString());
    localStorage.setItem('direfare_timer_timeleft', duration.toString());
    localStorage.setItem('direfare_timer_active', 'true');
    localStorage.setItem('direfare_timer_paused', 'false');

    channelRef.current?.postMessage({
      type: 'SYNC_TIMER',
      payload: { active: true, duration, timeLeft: duration, isPaused: false }
    });
    
    playSound.zoom(isMuted);
  };

  const pauseTimer = () => {
    setTimerIsPaused(true);
    localStorage.setItem('direfare_timer_paused', 'true');
    channelRef.current?.postMessage({
      type: 'SYNC_TIMER',
      payload: { isPaused: true }
    });
  };

  const resumeTimer = () => {
    setTimerIsPaused(false);
    localStorage.setItem('direfare_timer_paused', 'false');
    channelRef.current?.postMessage({
      type: 'SYNC_TIMER',
      payload: { isPaused: false }
    });
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimerIsPaused(false);
    localStorage.setItem('direfare_timer_active', 'false');
    localStorage.setItem('direfare_timer_paused', 'false');
    channelRef.current?.postMessage({
      type: 'SYNC_TIMER',
      payload: { active: false, isPaused: false }
    });
    playSound.close(isMuted);
  };

  return {
    teams,
    envelopes,
    activeEnvelopeId,
    animationStep,
    isMuted,
    pointLevels,
    categories,
    timerActive,
    timerDuration,
    timerTimeLeft,
    timerIsPaused,
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
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer
  };
}
