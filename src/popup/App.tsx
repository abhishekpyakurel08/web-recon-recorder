import React, { useState } from 'react';
import { TabType } from '../types/recon';
import { ReconTab } from './components/ReconTab';
import { NotepadTab } from './components/NotepadTab';
import { HistoryTab } from './components/HistoryTab';
import { Radar, FileEdit, History, Moon, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('recon');
  const [notepadDomainTarget, setNotepadDomainTarget] = useState<string>('');

  const handleSwitchToNotepad = (domain: string) => {
    setNotepadDomainTarget(domain);
    setActiveTab('notepad');
  };

  return (
    <div className="w-[450px] min-h-[580px] max-h-[600px] flex flex-col bg-dark-950 text-gray-100 selection:bg-sky-500 selection:text-white">
      {/* Extension Header */}
      <header className="px-4 py-3 bg-dark-900 border-b border-dark-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-sm text-gray-100 tracking-tight flex items-center space-x-1.5">
              <span>Web Recon Recorder</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">v1.0.0 • Passive Recon & Security Notes</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-gray-400">
          <div className="p-1.5 bg-dark-800 border border-dark-700 rounded-lg text-sky-400" title="Dark Mode Active">
            <Moon className="w-3.5 h-3.5" />
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="flex items-center bg-dark-900/60 border-b border-dark-800 px-2 pt-1.5 space-x-1">
        <button
          onClick={() => setActiveTab('recon')}
          className={`flex-1 py-2 px-3 rounded-t-xl text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition ${
            activeTab === 'recon'
              ? 'border-sky-400 bg-dark-800 text-sky-300'
              : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-dark-900/40'
          }`}
        >
          <Radar className="w-3.5 h-3.5" />
          <span>Recon</span>
        </button>

        <button
          onClick={() => setActiveTab('notepad')}
          className={`flex-1 py-2 px-3 rounded-t-xl text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition ${
            activeTab === 'notepad'
              ? 'border-sky-400 bg-dark-800 text-sky-300'
              : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-dark-900/40'
          }`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>Notepad</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-3 rounded-t-xl text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition ${
            activeTab === 'history'
              ? 'border-sky-400 bg-dark-800 text-sky-300'
              : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-dark-900/40'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
        </button>
      </nav>

      {/* Main Tab Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'recon' && <ReconTab onSwitchToNotepad={handleSwitchToNotepad} />}
        {activeTab === 'notepad' && <NotepadTab initialDomain={notepadDomainTarget} />}
        {activeTab === 'history' && <HistoryTab onSwitchToNotepad={handleSwitchToNotepad} />}
      </main>
    </div>
  );
}
