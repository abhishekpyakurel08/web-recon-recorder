import React, { useState, useEffect } from 'react';
import { WebPageMeta, ReconRecord } from '../../types/recon';
import { saveRecord, getDomainNotes } from '../../utils/storage';
import { Camera, Save, Globe, Cpu, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface ReconTabProps {
  onSwitchToNotepad: (domain: string) => void;
}

export const ReconTab: React.FC<ReconTabProps> = ({ onSwitchToNotepad }) => {
  const [pageMeta, setPageMeta] = useState<WebPageMeta>({
    url: '',
    domain: '',
    title: '',
    description: '',
    technologies: [],
  });
  const [screenshot, setScreenshot] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    fetchCurrentTabData();
  }, []);

  const fetchCurrentTabData = () => {
    setLoading(true);
    setErrorMsg('');

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0 || !tabs[0].id) {
          setLoading(false);
          setErrorMsg('No active browser tab found.');
          return;
        }

        const activeTab = tabs[0];
        const rawUrl = activeTab.url || '';
        let domain = '';
        try {
          domain = new URL(rawUrl).hostname;
        } catch {
          domain = rawUrl;
        }

        // Default initial data from chrome tab
        const initialData: WebPageMeta = {
          url: rawUrl,
          domain: domain,
          title: activeTab.title || domain,
          description: '',
          technologies: [],
        };

        setPageMeta(initialData);

        // Fetch existing note for this domain
        getDomainNotes().then((notesMap) => {
          if (notesMap[domain]) {
            setNotes(notesMap[domain].notes);
          }
        });

        // Inject / message content script to extract deep DOM meta & tech stack
        if (activeTab.id && !rawUrl.startsWith('chrome://') && !rawUrl.startsWith('edge://')) {
          chrome.tabs.sendMessage(activeTab.id, { action: 'GET_PAGE_DATA' }, (response) => {
            setLoading(false);
            if (chrome.runtime.lastError) {
              // Content script might not be loaded yet; execute inline scripting fallback
              executeScriptingFallback(activeTab.id!);
            } else if (response && response.success && response.data) {
              setPageMeta(response.data);
            }
          });
        } else {
          setLoading(false);
        }
      });
    } else {
      // Mock Data for Dev Preview in standard browser
      setLoading(false);
      const mockMeta: WebPageMeta = {
        url: 'https://example.com/security/login',
        domain: 'example.com',
        title: 'Example Security Portal',
        description: 'Secure enterprise application portal for website reconnaissance and security auditing.',
        technologies: ['Next.js', 'React', 'Tailwind CSS', 'Vite', 'Google Analytics'],
      };
      setPageMeta(mockMeta);
      setNotes('Login page found. Check security headers later.');
    }
  };

  const executeScriptingFallback = (tabId: number) => {
    if (chrome.scripting) {
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const metaDesc = document.querySelector('meta[name="description"]') ||
                           document.querySelector('meta[property="og:description"]');
          return {
            title: document.title,
            description: metaDesc ? metaDesc.getAttribute('content') || '' : '',
          };
        }
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const res = results[0].result;
          setPageMeta(prev => ({
            ...prev,
            title: res.title || prev.title,
            description: res.description || prev.description,
          }));
        }
      });
    }
  };

  const handleCaptureScreenshot = () => {
    setCapturing(true);
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'CAPTURE_SCREENSHOT' }, (response) => {
        setCapturing(false);
        if (response && response.success && response.screenshot) {
          setScreenshot(response.screenshot);
        } else {
          setErrorMsg(response?.error || 'Screenshot capture failed.');
        }
      });
    } else {
      // Mock screenshot in dev mode
      setTimeout(() => {
        setCapturing(false);
        // Canvas placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1e1e28';
          ctx.fillRect(0, 0, 400, 200);
          ctx.fillStyle = '#38bdf8';
          ctx.font = '16px sans-serif';
          ctx.fillText(`Screenshot Preview: ${pageMeta.domain}`, 30, 100);
        }
        setScreenshot(canvas.toDataURL());
      }, 500);
    }
  };

  const handleSaveRecord = async () => {
    if (!pageMeta.url) return;
    setSaveStatus('saving');

    const record: ReconRecord = {
      id: `${pageMeta.domain}-${Date.now()}`,
      url: pageMeta.url,
      domain: pageMeta.domain,
      title: pageMeta.title,
      description: pageMeta.description,
      technologies: pageMeta.technologies,
      notes: notes,
      timestamp: new Date().toISOString(),
      screenshot: screenshot,
    };

    try {
      await saveRecord(record);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-gray-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
        <p className="text-sm font-medium">Scanning current website...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 text-xs overflow-y-auto max-h-[510px]">
      {errorMsg && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 p-2.5 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Website Overview Card */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-800/80 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-sky-400" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm text-gray-100 truncate" title={pageMeta.title || pageMeta.domain}>
                {pageMeta.title || 'Untitled Page'}
              </h2>
              <p className="text-sky-400 text-xs font-mono truncate">{pageMeta.domain || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={fetchCurrentTabData}
            className="p-1.5 hover:bg-dark-800 text-gray-400 hover:text-gray-200 rounded-md transition"
            title="Rescan Page"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-dark-950/80 border border-dark-800 p-2 rounded-md font-mono text-[11px] text-gray-400 truncate">
          <span className="text-gray-500 mr-1.5">URL:</span>
          <a href={pageMeta.url} target="_blank" rel="noreferrer" className="hover:underline text-gray-300">
            {pageMeta.url}
          </a>
        </div>

        {pageMeta.description && (
          <p className="text-gray-400 italic line-clamp-2 leading-relaxed bg-dark-950/40 p-2 rounded border border-dark-800/50">
            "{pageMeta.description}"
          </p>
        )}
      </div>

      {/* Detected Technology Stack */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-gray-200 font-semibold">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Detected Tech Stack ({pageMeta.technologies.length})</span>
          </div>
        </div>

        {pageMeta.technologies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {pageMeta.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md bg-sky-950/80 border border-sky-800/60 text-sky-300 font-medium text-[11px] flex items-center space-x-1 shadow-xs"
              >
                <Layers className="w-3 h-3 text-sky-400" />
                <span>{tech}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-[11px]">No specific framework signatures detected on this page.</p>
        )}
      </div>

      {/* Screenshot Section */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-200 flex items-center space-x-1.5">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Page Screenshot</span>
          </span>
          <button
            onClick={handleCaptureScreenshot}
            disabled={capturing}
            className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded-lg text-[11px] font-medium transition flex items-center space-x-1 disabled:opacity-50"
          >
            {capturing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            <span>{screenshot ? 'Recapture' : 'Capture'}</span>
          </button>
        </div>

        {screenshot ? (
          <div className="relative group rounded-lg overflow-hidden border border-dark-700 max-h-36 bg-black">
            <img src={screenshot} alt="Page Screenshot" className="w-full object-cover max-h-36" />
          </div>
        ) : (
          <div className="h-20 bg-dark-950/60 border border-dashed border-dark-700 rounded-lg flex items-center justify-center text-gray-500">
            Click Capture to save visible tab preview
          </div>
        )}
      </div>

      {/* Quick Notes Input */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-gray-200">Notes ({pageMeta.domain || 'Domain'})</label>
          <button
            onClick={() => onSwitchToNotepad(pageMeta.domain)}
            className="text-sky-400 hover:text-sky-300 text-[11px] font-medium hover:underline"
          >
            Open Full Notepad →
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Login page found. Uses Next.js. Check headers..."
          className="w-full h-20 p-2.5 bg-dark-950 border border-dark-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500 resize-none font-mono text-xs"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveRecord}
        disabled={saveStatus === 'saving'}
        className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-lg ${
          saveStatus === 'saved'
            ? 'bg-emerald-600 text-white'
            : 'bg-sky-600 hover:bg-sky-500 text-white active:scale-[0.99]'
        }`}
      >
        {saveStatus === 'saving' && <RefreshCw className="w-4 h-4 animate-spin" />}
        {saveStatus === 'saved' && <CheckCircle2 className="w-4 h-4" />}
        {saveStatus === 'idle' && <Save className="w-4 h-4" />}
        <span>
          {saveStatus === 'saving'
            ? 'Saving Record...'
            : saveStatus === 'saved'
            ? 'Record Saved Successfully!'
            : 'Save Recon Record'}
        </span>
      </button>
    </div>
  );
};
