import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPolicyTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>LEGAL AND DATA HANDLING</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Last updated: November 2026</p>
        </div>

        <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-1.5">
            <h2 className="text-base font-semibold text-white">1. Overview</h2>
            <p>
              NeuroTune AI is a research demonstration web application for EEG-conditioned reinforcement
              learning and generative music synthesis. We respect your privacy and keep data processing
              inside your browser wherever possible.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-semibold text-white">2. Information Stored in Your Browser</h2>
            <p>
              When you choose or create a listener profile, or complete a 10-step session, the app saves
              that session log and profile settings inside your browser using localStorage. This allows
              you to review past sessions in the Saved Sessions tab. You can export or delete all stored
              records at any time from the Saved Sessions screen.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-semibold text-white">3. Brainwave Data and Uploaded CSV Files</h2>
            <p>
              By default, the website runs using a synthetic mathematical EEG signal simulator. If you
              upload a CSV EEG file on the Brainwaves tab, the file is read locally in browser memory
              to compute frequency band power and draw waveforms. Uploaded CSV files are not sold,
              shared with advertisers, or used for profiling.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-semibold text-white">4. Audio Playback</h2>
            <p>
              All music is synthesized locally in your browser using the Web Audio API. NeuroTune AI
              does not access your microphone, camera, or location sensors.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-semibold text-white">5. Cookies, Tracking, and Contact</h2>
            <p>
              This application does not run third-party advertising trackers or behavioral ad cookies.
              If you deploy this application on your own custom domain or backend server, you should
              update server retention notices to match your hosting configuration.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
