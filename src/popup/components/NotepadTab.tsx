import React, { useState, useEffect, useRef } from 'react';
import { DomainNote } from '../../types/recon';
import { getDomainNotes, saveDomainNote, togglePinDomainNote, downloadNoteAsTXT } from '../../utils/storage';
import { 
  Pin, 
  Copy, 
  Download, 
  Check, 
  Eye, 
  Edit3, 
  Search, 
  Globe, 
  Sparkles,
  FileText 
} from 'lucide-react';

interface NotepadTabProps {
  initialDomain?: string;
}

export const NotepadTab: React.FC<NotepadTabProps> = ({ initialDomain }) => {
  const [notesMap, setNotesMap] = useState<Record<string, DomainNote>>({});
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');
  const [copied, setCopied] = useState<boolean>(false);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [domainSearch, setDomainSearch] = useState<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadNotes();

    return () => {
      // Cleanup timer on unmount to prevent memory leaks
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const loadNotes = async () => {
    const data = await getDomainNotes();
    setNotesMap(data);

    let activeDom = initialDomain || '';
    if (!activeDom && typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].url) {
          try {
            activeDom = new URL(tabs[0].url).hostname;
          } catch {
            activeDom = '';
          }
        }
        selectDomain(activeDom || Object.keys(data)[0] || 'example.com', data);
      });
    } else {
      selectDomain(activeDom || Object.keys(data)[0] || 'example.com', data);
    }
  };

  const selectDomain = (domain: string, map = notesMap) => {
    setSelectedDomain(domain);
    const existing = map[domain];
    if (existing) {
      setNoteContent(existing.notes);
      setIsPinned(existing.pinned);
    } else {
      setNoteContent('');
      setIsPinned(false);
    }
    setSaveState('saved');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNoteContent(value);
    setSaveState('saving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      if (selectedDomain) {
        const updatedMap = await saveDomainNote(selectedDomain, value, isPinned);
        setNotesMap(updatedMap);
        setSaveState('saved');
      }
    }, 600);
  };

  const handleTogglePin = async () => {
    if (!selectedDomain) return;
    const updatedMap = await togglePinDomainNote(selectedDomain);
    setNotesMap(updatedMap);
    setIsPinned(!isPinned);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(noteContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedDomain) return;
    downloadNoteAsTXT(selectedDomain, noteContent);
  };

  const domainsList = Object.keys(notesMap).filter(d => 
    d.toLowerCase().includes(domainSearch.toLowerCase())
  );

  if (selectedDomain && !domainsList.includes(selectedDomain) && selectedDomain.toLowerCase().includes(domainSearch.toLowerCase())) {
    domainsList.unshift(selectedDomain);
  }

  return (
    <div className="p-4 space-y-3 text-xs flex flex-col h-[510px]">
      {/* Domain Selection Header */}
      <div className="flex items-center justify-between bg-dark-900 border border-dark-700 p-2.5 rounded-xl">
        <div className="flex items-center space-x-2 flex-1 min-w-0 mr-2">
          <Globe className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Active Website Note</label>
            <input
              type="text"
              value={selectedDomain}
              onChange={(e) => {
                const dom = e.target.value.trim();
                setSelectedDomain(dom);
                selectDomain(dom);
              }}
              placeholder="Enter domain (e.g. example.com)"
              className="bg-transparent font-mono text-xs text-sky-300 font-bold focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleTogglePin}
            className={`p-1.5 rounded-lg border transition ${
              isPinned
                ? 'bg-amber-950 border-amber-700 text-amber-300'
                : 'bg-dark-800 border-dark-700 text-gray-400 hover:text-gray-200'
            }`}
            title={isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="p-1.5 bg-dark-800 border border-dark-700 text-gray-400 hover:text-gray-200 rounded-lg transition"
            title={isPreview ? 'Edit Note' : 'Markdown Preview'}
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 bg-dark-800 border border-dark-700 text-gray-400 hover:text-gray-200 rounded-lg transition"
            title="Copy Note to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 bg-dark-800 border border-dark-700 text-gray-400 hover:text-gray-200 rounded-lg transition"
            title="Download TXT Note"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Domain Switcher Dropdown / Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
          <input
            type="text"
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
            placeholder="Search saved website notes..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {domainsList.length > 0 && (
          <select
            value={selectedDomain}
            onChange={(e) => selectDomain(e.target.value)}
            className="bg-dark-900 border border-dark-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none font-mono"
          >
            {domainsList.map((d) => (
              <option key={d} value={d}>
                {notesMap[d]?.pinned ? '📌 ' : ''}{d}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Editor & Preview Area */}
      <div className="flex-1 bg-dark-900 border border-dark-700 rounded-xl p-3 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-dark-800">
          <span className="text-[11px] font-medium text-gray-400 flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>{isPreview ? 'Markdown Preview' : 'Domain Note Editor'}</span>
          </span>
          <span className="text-[10px] font-mono flex items-center space-x-1 text-gray-400">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{saveState === 'saving' ? 'Auto-saving...' : 'Auto-saved'}</span>
          </span>
        </div>

        {isPreview ? (
          <div className="flex-1 p-2 font-sans text-xs text-gray-200 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {noteContent ? (
              noteContent
            ) : (
              <span className="text-gray-500 italic">No note content to preview.</span>
            )}
          </div>
        ) : (
          <textarea
            value={noteContent}
            onChange={handleTextChange}
            placeholder={`Website: ${selectedDomain || 'example.com'}\nNotes:\n- Login page found\n- Uses Next.js\n- Interesting API endpoint observed (/api/v1/user)\n- Check security headers later`}
            className="w-full flex-1 bg-transparent text-gray-200 placeholder-gray-600 focus:outline-none resize-none font-mono text-xs leading-relaxed overflow-y-auto"
          />
        )}
      </div>
    </div>
  );
};
