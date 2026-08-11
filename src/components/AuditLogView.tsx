import React, { useState } from 'react';
import { AuditEntry, Case } from '../types';
import { ClipboardList, Search, Filter, Download } from 'lucide-react';

interface AuditLogProps {
  auditLogs: AuditEntry[];
  cases: Case[];
}

export const AuditLogView: React.FC<AuditLogProps> = ({ auditLogs, cases }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.analyst.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.hash.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCase = selectedCase === 'ALL' || log.caseId === selectedCase;
    const matchesStatus = selectedStatus === 'ALL' || log.status === selectedStatus;

    return matchesSearch && matchesCase && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-cyan-400" /> Forensic System Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete, immutable system event log recording all analyst interactions and API calls.
          </p>
        </div>

        <button
          onClick={() => {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', `audioshield_audit_log_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 shrink-0"
        >
          <Download className="w-4 h-4 text-cyan-400" /> Export Audit Log
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search event ID, hash, operation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 py-2 pl-9 pr-3 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 py-2 px-3 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Cases</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 py-2 px-3 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="WARNING">WARNING</option>
            <option value="FAILURE">FAILURE</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Event ID</th>
              <th className="py-2.5 px-3">Case ID</th>
              <th className="py-2.5 px-3">Operation</th>
              <th className="py-2.5 px-3">Analyst</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Subsystem</th>
              <th className="py-2.5 px-3">SHA-256 Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                  No matching audit logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-950/60 transition-colors">
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-cyan-300">{log.id}</td>
                  <td className="py-3 px-3 text-slate-200">{log.caseId}</td>
                  <td className="py-3 px-3 text-slate-100 font-semibold">{log.operation}</td>
                  <td className="py-3 px-3 text-slate-300">{log.analyst}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : log.status === 'WARNING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">{log.component}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">
                    {log.hash.slice(0, 16)}...
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
