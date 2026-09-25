import React, { useState, useEffect } from 'react';
import { ReconRecord } from '../../types/recon';
import { getRecords, deleteRecord, clearAllRecords, exportAsJSON, exportAsCSV } from '../../utils/storage';
import { 
  Search, 
  Trash2, 
  Download, 
  ExternalLink, 
  Calendar, 
  Layers, 
  FileText, 
  X, 
  CheckCircle2,
  Globe,
  Database
} from 'lucide-react';

interface HistoryTabProps {
  onSwitchToNotepad: (domain: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onSwitchToNotepad }) => {
  const [records, setRecords] = useState<ReconRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [activeRecordModal, setActiveRecordModal] = useState<ReconRecord | null>(null);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getRecords();
    setRecords(data);
  };

  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await deleteRecord(id);
    setRecords(updated);
    if (activeRecordModal?.id === id) {
      setActiveRecordModal(null);
    }
  };

  const handleClearAll = async () => {
    await clearAllRecords();
    setRecords([]);
    setConfirmClear(false);
  };

  // Collect all unique tech names for filter chips
  const allTechnologies = Array.from(
    new Set(records.flatMap((r) => r.technologies || []))
  );

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.technologies || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTech = selectedTech ? (r.technologies || []).includes(selectedTech) : true;

    return matchesSearch && matchesTech;
  });

  return (
    <div className="p-4 space-y-3 text-xs flex flex-col h-[510px]">
      {/* Search & Export Toolbar */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records, domains, notes, tech..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={() => exportAsJSON(filteredRecords)}
            title="Export Records as JSON"
            className="px-2 py-1.5 bg-dark-900 border border-dark-700 hover:bg-dark-800 text-sky-400 rounded-lg font-medium transition flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => exportAsCSV(filteredRecords)}
            title="Export Records as CSV"
            className="px-2 py-1.5 bg-dark-900 border border-dark-700 hover:bg-dark-800 text-emerald-400 rounded-lg font-medium transition flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>

        {/* Tech Filter Chips */}
        {allTechnologies.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Filter:</span>
            <button
              onClick={() => setSelectedTech('')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition ${
                selectedTech === ''
                  ? 'bg-sky-500 text-white'
                  : 'bg-dark-900 text-gray-400 hover:text-gray-200 border border-dark-700'
              }`}
            >
              All
            </button>
            {allTechnologies.map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTech(selectedTech === tech ? '' : tech)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition whitespace-nowrap ${
                  selectedTech === tech
                    ? 'bg-sky-500 text-white'
                    : 'bg-dark-900 text-gray-400 hover:text-gray-200 border border-dark-700'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Record List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              onClick={() => setActiveRecordModal(record)}
              className="bg-dark-900 border border-dark-700 hover:border-dark-600 rounded-xl p-3 space-y-2 transition cursor-pointer group shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <Globe className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-100 text-xs truncate group-hover:text-sky-300 transition">
                      {record.title || record.domain}
                    </h3>
                    <p className="text-[11px] text-sky-400 font-mono truncate">{record.domain}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-gray-500 flex items-center space-x-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                  </span>
                  <button
                    onClick={(e) => handleDeleteRecord(record.id, e)}
                    className="p-1 hover:bg-red-950/60 text-gray-500 hover:text-red-400 rounded transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Technologies Badges */}
              {record.technologies && record.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {record.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-dark-950 text-sky-300 border border-dark-800 text-[10px] font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {record.technologies.length > 4 && (
                    <span className="px-1.5 py-0.5 text-gray-500 text-[10px]">
                      +{record.technologies.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Notes Snippet */}
              {record.notes && (
                <p className="text-gray-400 text-[11px] line-clamp-1 italic bg-dark-950/60 p-1.5 rounded border border-dark-800">
                  "{record.notes}"
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 space-y-2">
            <Database className="w-8 h-8 text-gray-600" />
            <p className="text-xs">No saved recon records found.</p>
          </div>
        )}
      </div>

      {/* Clear All Header/Footer */}
      {records.length > 0 && (
        <div className="pt-2 border-t border-dark-800 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Total Records: <strong className="text-gray-300 font-mono">{records.length}</strong>
          </span>

          {confirmClear ? (
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-red-400 font-semibold">Delete all?</span>
              <button
                onClick={handleClearAll}
                className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2 py-0.5 bg-dark-800 text-gray-300 rounded text-[10px]"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-[10px] text-red-400 hover:text-red-300 hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      )}

      {/* Detail Record Modal */}
      {activeRecordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-sm max-h-[480px] overflow-y-auto p-4 space-y-3 shadow-2xl relative text-xs">
            <div className="flex items-start justify-between border-b border-dark-800 pb-2">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-100 text-sm truncate">{activeRecordModal.title}</h3>
                <p className="text-sky-400 font-mono text-xs">{activeRecordModal.domain}</p>
              </div>
              <button
                onClick={() => setActiveRecordModal(null)}
                className="p-1 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-dark-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-semibold">URL</label>
                <a
                  href={activeRecordModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sky-400 hover:underline truncate font-mono text-[11px]"
                >
                  {activeRecordModal.url}
                  <ExternalLink className="w-3 h-3 inline ml-1" />
                </a>
              </div>

              {activeRecordModal.description && (
                <div>
                  <label className="text-[10px] uppercase text-gray-500 font-semibold">Meta Description</label>
                  <p className="text-gray-300 text-[11px] leading-relaxed bg-dark-950 p-2 rounded-lg border border-dark-800">
                    {activeRecordModal.description}
                  </p>
                </div>
              )}

              {activeRecordModal.technologies && activeRecordModal.technologies.length > 0 && (
                <div>
                  <label className="text-[10px] uppercase text-gray-500 font-semibold">Tech Stack</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeRecordModal.technologies.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeRecordModal.screenshot && (
                <div>
                  <label className="text-[10px] uppercase text-gray-500 font-semibold">Screenshot</label>
                  <img
                    src={activeRecordModal.screenshot}
                    alt="Page Screenshot"
                    className="w-full rounded-lg border border-dark-700 mt-1 max-h-36 object-cover"
                  />
                </div>
              )}

              {activeRecordModal.notes && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-500 font-semibold">Saved Note</label>
                    <button
                      onClick={() => {
                        const dom = activeRecordModal.domain;
                        setActiveRecordModal(null);
                        onSwitchToNotepad(dom);
                      }}
                      className="text-sky-400 hover:underline text-[10px]"
                    >
                      Open in Notepad →
                    </button>
                  </div>
                  <pre className="text-gray-300 font-mono text-[11px] bg-dark-950 p-2.5 rounded-lg border border-dark-800 whitespace-pre-wrap leading-relaxed">
                    {activeRecordModal.notes}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
