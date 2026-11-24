import React from 'react';
import { FileText } from 'lucide-react';

export const TermsTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-700 font-semibold mb-1">
            <FileText className="w-4 h-4" />
            <span>RESEARCH SOFTWARE TERMS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Terms and Conditions</h1>
          <p className="text-xs text-slate-500 mt-1">Last updated: November 2026</p>
        </div>

        <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-1.5">
            <h2 className="text-base font-semibold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the NeuroTune AI web application, you agree to these Terms and
              Conditions. If you do not agree with these terms, please discontinue use of the site.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-semibold text-slate-900">2. Research and Educational Purpose Only</h2>
            <p>
              NeuroTune AI implements the closed-loop simulation framework described in the research paper
              "EEG-Conditioned Reinforcement Learning for Personalized Generative Music Therapy." All
              mood predictions, reinforcement learning updates, and benchmark figures reflect computational
              simulations and educational demonstrations.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-semibold text-slate-900">3. No Medical Advice or Clinical Diagnosis</h2>
            <p>
              This software is not a medical device and is not cleared or approved by any medical
              regulatory authority. It must not be used to diagnose, treat, cure, or prevent any
              physical, neurological, or mental health condition. Always consult a qualified healthcare
              professional regarding medical or therapeutic decisions.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-semibold text-slate-900">4. Audio Safety</h2>
            <p>
              Real-time audio is generated through your browser speakers or headphones. Adjust your
              system volume to a comfortable level before starting audio playback.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-semibold text-slate-900">5. Limitation of Liability</h2>
            <p>
              The software is provided "as is" without warranties of any kind. The authors and
              maintainers are not liable for any direct or indirect damages resulting from the use of
              this research simulation or any CSV datasets loaded by the user.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
