import { useState, useEffect, useRef } from 'react';
import { type Team, type Envelope, DEFAULT_TEAMS, DEFAULT_ENVELOPES } from '../utils/defaults';
import { playSound } from '../utils/audio';

export interface GameState {
  teams: Team[];
  envelopes: Envelope[];
  activeEnvelopeId: string | null;
  animationStep: 'closed' | 'zoomed' | 'opened' | 'revealed';
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
    return saved ? JSON.parse(saved) : DEFAULT_ENVELOPES;
  });

  const [activeEnvelopeId, setActiveEnvelopeId] = useState<string | null>(() => {
    return localStorage.getItem('direfare_active_envelope');
  });

  const [animationStep, setAnimationStep] = useState<'closed' | 'zoomed' | 'opened' | 'revealed'>(() => {
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
          break;

        case 'TRIGGER_OPEN_ENVELOPE':
          setActiveEnvelopeId(payload.id);
          setAnimationStep('zoomed');
          playSound.zoom(isMuted);
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
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isMuted]);

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

  const openEnvelope = (id: string) => {
    setActiveEnvelopeId(id);
    setAnimationStep('zoomed');
    localStorage.setItem('direfare_active_envelope', id);
    localStorage.setItem('direfare_animation_step', 'zoomed');
    
    // Broadcast action
    channelRef.current?.postMessage({
      type: 'TRIGGER_OPEN_ENVELOPE',
      payload: { id }
    });
    playSound.zoom(isMuted);
  };

  const changeAnimationStep = (step: 'closed' | 'zoomed' | 'opened' | 'revealed') => {
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

  const triggerSound = (soundType: 'zoom' | 'open' | 'reveal' | 'close') => {
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
  };

  return {
    teams,
    envelopes,
    activeEnvelopeId,
    animationStep,
    isMuted,
    pointLevels,
    updateTeams,
    updateEnvelopes,
    updatePointLevels,
    openEnvelope,
    closeEnvelope,
    changeAnimationStep,
    toggleMute,
    triggerSound,
    resetAllGame
  };
}
