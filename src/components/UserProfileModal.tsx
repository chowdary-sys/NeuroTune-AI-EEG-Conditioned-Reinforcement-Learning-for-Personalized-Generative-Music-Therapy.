import React, { useState } from 'react';
import { Check, User, X } from 'lucide-react';
import { ListenerProfile, NoteDensity } from '../types/neurotune';
import { defaultStorage } from '../services/storageService';
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

  const [name, setName] = useState(activeProfile.name);
  const [targetValence, setTargetValence] = useState(activeProfile.targetEmotion.valence);
  const [targetArousal, setTargetArousal] = useState(activeProfile.targetEmotion.arousal);
  const [tempoMin, setTempoMin] = useState(activeProfile.preferredTempoRange[0]);
  const [tempoMax, setTempoMax] = useState(activeProfile.preferredTempoRange[1]);
  const [majorAffinity] = useState(activeProfile.modeAffinity.major);
  const [densityPref, setDensityPref] = useState<NoteDensity>(activeProfile.densityPreference);
  const [heterogeneity, setHeterogeneity] = useState(activeProfile.heterogeneityFactor);
  const [noise] = useState(activeProfile.noiseLevel);

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
      name: name || 'Custom Listener',
      role: 'Study Participant',
      targetEmotion: {
        valence: parseFloat(targetValence.toFixed(2)),
        arousal: parseFloat(targetArousal.toFixed(2)),
        label: `Custom Goal (Mood: ${targetValence > 0 ? `+${targetValence.toFixed(2)}` : targetValence.toFixed(2)}, Energy: ${targetArousal > 0 ? `+${targetArousal.toFixed(2)}` : targetArousal.toFixed(2)})`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Choose a Listener Profile</h3>
              <p className="text-xs text-slate-600">Pick who is listening so the AI knows their mood goal and music tastes.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="my-5">
          <div className="text-xs font-medium text-slate-600 mb-3">
            Ready-Made Listener Profiles:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profiles.map((p) => {
              const isSelected = selectedId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-50 border-cyan-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{p.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-600" />}
                  </div>
                  <div className="text-[11px] text-cyan-800 font-medium">
                    Goal: {p.targetEmotion.label}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 font-mono">
                    Favorite speed: {p.preferredTempoRange[0]} to {p.preferredTempoRange[1]} BPM · {p.modeAffinity.major >= 0.5 ? 'Prefers Major' : 'Prefers Minor'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Profile Toggle */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setIsEditingCustom(!isEditingCustom)}
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
          >
            {isEditingCustom ? '- Hide Custom Profile Form' : '+ Create Your Own Listener Profile'}
          </button>

          {isEditingCustom && (
            <form onSubmit={handleSaveCustom} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Listener Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900"
                  placeholder="e.g., Alex (Evening Relaxation)"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1 text-slate-700">
                    <span>Goal Mood (Valence):</span>
                    <span className="text-emerald-700 font-mono font-bold">{targetValence > 0 ? `+${targetValence}` : targetValence}</span>
                  </div>
                  <input
                    type="range"
                    min="-0.8"
                    max="0.9"
                    step="0.05"
                    value={targetValence}
                    onChange={(e) => setTargetValence(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-700">
                    <span>Goal Energy (Arousal):</span>
                    <span className="text-cyan-700 font-mono font-bold">{targetArousal > 0 ? `+${targetArousal}` : targetArousal}</span>
                  </div>
                  <input
                    type="range"
                    min="-0.8"
                    max="0.8"
                    step="0.05"
                    value={targetArousal}
                    onChange={(e) => setTargetArousal(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Slowest Favorite Speed (BPM):</label>
                  <input
                    type="number"
                    min="50"
                    max="110"
                    value={tempoMin}
                    onChange={(e) => setTempoMin(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Fastest Favorite Speed (BPM):</label>
                  <input
                    type="number"
                    min="70"
                    max="150"
                    value={tempoMax}
                    onChange={(e) => setTempoMax(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Favorite Note Busyness:</label>
                  <select
                    value={densityPref}
                    onChange={(e) => setDensityPref(e.target.value as NoteDensity)}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900"
                  >
                    <option value="sparse">Sparse (Slow & Peaceful)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="dense">Dense (Active & Flowing)</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-slate-700">
                    <span>Unique Taste Difference (h):</span>
                    <span className="text-cyan-700 font-mono font-bold">{heterogeneity}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.45"
                    step="0.05"
                    value={heterogeneity}
                    onChange={(e) => setHeterogeneity(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md text-xs transition-colors cursor-pointer mt-2"
              >
                Save & Use This Profile
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
