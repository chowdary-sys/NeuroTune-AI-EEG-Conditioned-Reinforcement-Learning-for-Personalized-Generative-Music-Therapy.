import React, { useState } from 'react';
import { Check, User, X } from 'lucide-react';
import { ListenerProfile, NoteDensity } from '../types/neurotune';
import { DEFAULT_PROFILES, defaultStorage } from '../services/storageService';
import { defaultClosedLoopController } from '../services/closedLoopController';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: ListenerProfile;
  onProfileUpdated: (profile: ListenerProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onProfileUpdated,
}) => {
  const [profiles, setProfiles] = useState<ListenerProfile[]>(defaultStorage.getProfiles());
  const [selectedId, setSelectedId] = useState<string>(activeProfile.id);
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  // Custom editor state
  const [name, setName] = useState(activeProfile.name);
  const [targetValence, setTargetValence] = useState(activeProfile.targetEmotion.valence);
  const [targetArousal, setTargetArousal] = useState(activeProfile.targetEmotion.arousal);
  const [tempoMin, setTempoMin] = useState(activeProfile.preferredTempoRange[0]);
  const [tempoMax, setTempoMax] = useState(activeProfile.preferredTempoRange[1]);
  const [majorAffinity, setMajorAffinity] = useState(activeProfile.modeAffinity.major);
  const [densityPref, setDensityPref] = useState<NoteDensity>(activeProfile.densityPreference);
  const [heterogeneity, setHeterogeneity] = useState(activeProfile.heterogeneityFactor);
  const [noise, setNoise] = useState(activeProfile.noiseLevel);

  if (!isOpen) return null;

  const handleSelectPreset = (p: ListenerProfile) => {
    setSelectedId(p.id);
    defaultStorage.setActiveProfileId(p.id);
    defaultClosedLoopController.setListenerProfile(p);
    onProfileUpdated(p);
    setIsEditingCustom(false);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const customProfile: ListenerProfile = {
      id: `custom-${Date.now().toString(36)}`,
      name: name || 'Custom Research Subject',
      role: 'Clinical Subject',
      targetEmotion: {
        valence: parseFloat(targetValence.toFixed(2)),
        arousal: parseFloat(targetArousal.toFixed(2)),
        label: `Custom (V: ${targetValence > 0 ? `+${targetValence.toFixed(2)}` : targetValence.toFixed(2)}, A: ${targetArousal > 0 ? `+${targetArousal.toFixed(2)}` : targetArousal.toFixed(2)})`,
      },
      preferredTempoRange: [tempoMin, tempoMax],
      modeAffinity: {
        major: majorAffinity,
        minor: 1 - majorAffinity,
      },
      densityPreference: densityPref,
      heterogeneityFactor: heterogeneity,
      noiseLevel: noise,
    };

    const updatedList = [...profiles, customProfile];
    defaultStorage.saveProfiles(updatedList);
    setProfiles(updatedList);
    handleSelectPreset(customProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Listener Profile & Affective Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="my-5">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
            Select Active Research Cohort Preset
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profiles.map((p) => {
              const isSelected = selectedId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className="text-[11px] text-cyan-300 font-mono">
                    Target: {p.targetEmotion.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    BPM: {p.preferredTempoRange[0]}-{p.preferredTempoRange[1]} · Mode: {p.modeAffinity.major >= 0.5 ? 'Major' : 'Minor'} · h: {p.heterogeneityFactor}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Profile Accordion / Toggle */}
        <div className="pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setIsEditingCustom(!isEditingCustom)}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            {isEditingCustom ? '− Hide Custom Parameters Editor' : '+ Create / Customize Listener Profile'}
          </button>

          {isEditingCustom && (
            <form onSubmit={handleSaveCustom} className="mt-4 space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Subject / Cohort Label:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  placeholder="e.g., Clinical Participant #05"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1 text-slate-400">
                    <span>Target Valence:</span>
                    <span className="text-emerald-400 font-bold">{targetValence > 0 ? `+${targetValence}` : targetValence}</span>
                  </div>
                  <input
                    type="range"
                    min="-0.8"
                    max="0.9"
                    step="0.05"
                    value={targetValence}
                    onChange={(e) => setTargetValence(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-400">
                    <span>Target Arousal:</span>
                    <span className="text-cyan-400 font-bold">{targetArousal > 0 ? `+${targetArousal}` : targetArousal}</span>
                  </div>
                  <input
                    type="range"
                    min="-0.8"
                    max="0.8"
                    step="0.05"
                    value={targetArousal}
                    onChange={(e) => setTargetArousal(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Preferred Min BPM:</label>
                  <input
                    type="number"
                    min="50"
                    max="110"
                    value={tempoMin}
                    onChange={(e) => setTempoMin(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Preferred Max BPM:</label>
                  <input
                    type="number"
                    min="70"
                    max="150"
                    value={tempoMax}
                    onChange={(e) => setTempoMax(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Density Preference:</label>
                  <select
                    value={densityPref}
                    onChange={(e) => setDensityPref(e.target.value as NoteDensity)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="sparse">Sparse (Meditative 1/2 notes)</option>
                    <option value="medium">Medium (Quarter notes)</option>
                    <option value="dense">Dense (Eighth notes)</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-slate-400">
                    <span>Heterogeneity (h):</span>
                    <span className="text-indigo-400 font-bold">{heterogeneity}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.45"
                    step="0.05"
                    value={heterogeneity}
                    onChange={(e) => setHeterogeneity(parseFloat(e.target.value))}
                    className="w-full accent-indigo-400 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer mt-2"
              >
                Save & Activate Custom Profile
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
