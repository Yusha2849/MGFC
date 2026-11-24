import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { GovernanceMeeting, ClubDocument } from '../../types';
import { DateInput } from '../common/DateInput';
import { formatDateMMDDYYYY } from '../../utils/dateFormat';
import {
  Plus,
  Calendar,
  Download,
  Search,
  X,
  Eye,
  FileCheck,
} from 'lucide-react';

export const GovernanceTab: React.FC = () => {
  const {
    meetings,
    documents,
    addMeeting,
    updateMeeting,
    toggleActionItemStatus,
    addDocument,
    deleteDocument,
    showToast,
  } = useClub();

  const [activeSubTab, setActiveSubTab] = useState<'meetings' | 'documents'>('meetings');
  const [selectedMeeting, setSelectedMeeting] = useState<GovernanceMeeting | null>(meetings[0] || null);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<ClubDocument | null>(null);
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('all');
  const [docSearch, setDocSearch] = useState('');

  // Add Meeting Form State
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    type: 'Executive Committee' as GovernanceMeeting['type'],
    date: new Date().toISOString().split('T')[0],
    time: '19:00 - 21:00',
    venue: 'Marlboro Gardens Community Centre Boardroom',
    status: 'Upcoming' as 'Upcoming' | 'Completed',
    attendees: 'Faizel Loonat (Chairperson), Ismail Rawat, Rashid Moosa, Haroon Wadee',
    agenda: '1. Financial review\n2. Pitch facility updates\n3. Youth academy registration',
    minutesSummary: '',
  });

  // Action item form state for a meeting
  const [newActionItem, setNewActionItem] = useState({
    task: '',
    assignee: 'Rashid Moosa (Secretary)',
    dueDate: new Date().toISOString().split('T')[0],
  });

  // Upload document form
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Constitution & Bylaws' as ClubDocument['category'],
    description: '',
    tags: 'Governance, Official',
  });

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title) return;

    addMeeting({
      title: meetingForm.title,
      type: meetingForm.type,
      date: meetingForm.date,
      time: meetingForm.time,
      venue: meetingForm.venue,
      status: meetingForm.status,
      attendees: meetingForm.attendees.split(',').map(s => s.trim()),
      agenda: meetingForm.agenda.split('\n').filter(Boolean),
      minutesSummary: meetingForm.minutesSummary || 'Meeting scheduled.',
      actionItems: [],
    });
    setIsAddMeetingOpen(false);
  };

  const handleAddActionItem = (meetingId: string) => {
    if (!newActionItem.task) return;
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    const updated = {
      ...meeting,
      actionItems: [
        ...meeting.actionItems,
        {
          id: `act-${Date.now().toString().slice(-4)}`,
          task: newActionItem.task,
          assignee: newActionItem.assignee,
          dueDate: newActionItem.dueDate,
          status: 'Pending' as const,
        },
      ],
    };
    updateMeeting(updated);
    if (selectedMeeting?.id === meetingId) {
      setSelectedMeeting(updated);
    }
    setNewActionItem({ task: '', assignee: 'Rashid Moosa (Secretary)', dueDate: new Date().toISOString().split('T')[0] });
    showToast('Action item assigned to meeting minutes.');
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title) return;

    addDocument({
      title: docForm.title,
      category: docForm.category,
      lastUpdated: formatDateMMDDYYYY(new Date()),
      fileSize: '1.4 MB',
      fileFormat: 'PDF',
      description: docForm.description || 'Official club documentation registered in repository.',
      tags: docForm.tags.split(',').map(t => t.trim()),
      downloadName: `${docForm.title.replace(/\s+/g, '_')}.pdf`,
    });
    setIsUploadDocOpen(false);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCat = docCategoryFilter === 'all' || doc.category === docCategoryFilter;
    const query = docSearch.toLowerCase();
    const matchesQuery = !query || doc.title.toLowerCase().includes(query) || doc.description.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#E31E24] uppercase tracking-wider mb-1">
            <FileCheck className="w-4 h-4" /> Official Records & Secretariat
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-wide">
            Governance, Meetings & Compliance Documents
          </h2>
          <p className="text-xs text-[#718096] mt-0.5 font-medium">
            Executive Committee minutes, AGM resolutions, constitutional statutes, and SAFA compliance policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'meetings' ? (
            <button
              onClick={() => setIsAddMeetingOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/25 transition-all"
            >
              <Plus className="w-4 h-4" /> Schedule Committee Meeting
            </button>
          ) : (
            <button
              onClick={() => setIsUploadDocOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/25 transition-all"
            >
              <Plus className="w-4 h-4" /> Deposit Official Document
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white rounded-2xl border border-slate-200 max-w-md shadow-xs">
        <button
          onClick={() => setActiveSubTab('meetings')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'meetings'
              ? 'bg-[#E31E24] text-white shadow-xs'
              : 'text-[#718096] hover:text-[#0B1F3A]'
          }`}
        >
          Meetings & Action Items ({meetings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('documents')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'documents'
              ? 'bg-[#E31E24] text-white shadow-xs'
              : 'text-[#718096] hover:text-[#0B1F3A]'
          }`}
        >
          Document Repository ({documents.length})
        </button>
      </div>

      {/* Subtab 1: Meetings & Action Items */}
      {activeSubTab === 'meetings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Meetings List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {meetings.map(m => {
              const pendingCount = m.actionItems.filter(i => i.status !== 'Completed').length;
              const isSelected = selectedMeeting?.id === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeeting(m)}
                  className={`cursor-pointer p-5 rounded-3xl border transition-all ${
                    isSelected
                      ? 'bg-white border-[#E31E24] ring-2 ring-[#E31E24]/20 shadow-md'
                      : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <span className="font-bold text-[#E31E24] uppercase tracking-wider text-[10px]">
                      {m.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'Completed'
                          ? 'bg-slate-100 text-[#718096]'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] mt-2 mb-1 uppercase tracking-wide">
                    {m.title}
                  </h3>

                  <div className="text-xs text-[#718096] space-y-1 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#E31E24]" />
                      <span className="tabular-nums">{formatDateMMDDYYYY(m.date)} • {m.time}</span>
                    </div>
                    <div>Venue: <strong className="text-[#0B1F3A]">{m.venue}</strong></div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                    <span className="text-[#718096]">
                      Action Items: <strong className="text-[#0B1F3A]">{m.actionItems.length}</strong>
                    </span>
                    {pendingCount > 0 ? (
                      <span className="text-[#E31E24] font-bold">{pendingCount} pending</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">All resolved</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meeting Details & Action Items Workbench (7 cols) */}
          <div className="lg:col-span-7">
            {selectedMeeting ? (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#E31E24] uppercase tracking-wider">
                      {selectedMeeting.type}
                    </span>
                    <h3 className="text-2xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-wide mt-1">
                      {selectedMeeting.title}
                    </h3>
                    <div className="text-xs text-[#718096] font-medium mt-1 tabular-nums">
                      {formatDateMMDDYYYY(selectedMeeting.date)} ({selectedMeeting.time}) • {selectedMeeting.venue}
                    </div>
                  </div>
                </div>

                {/* Attendees */}
                <div>
                  <h4 className="text-xs font-bold text-[#718096] uppercase tracking-wider mb-2">
                    Confirmed Attendees
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMeeting.attendees.map((att, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-[#F0F4F9] border border-slate-200 text-xs font-medium text-[#0B1F3A]"
                      >
                        {att}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Agenda */}
                <div>
                  <h4 className="text-xs font-bold text-[#718096] uppercase tracking-wider mb-2">
                    Adopted Agenda Items
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#0B1F3A] font-medium bg-[#F0F4F9] p-4 rounded-2xl border border-slate-200">
                    {selectedMeeting.agenda.map((ag, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#E31E24] font-bold">•</span>
                        <span>{ag}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Minutes Summary */}
                <div>
                  <h4 className="text-xs font-bold text-[#718096] uppercase tracking-wider mb-2">
                    Executive Minutes Summary & Resolutions
                  </h4>
                  <div className="text-xs text-[#0B1F3A] font-medium bg-[#F0F4F9] p-4 rounded-2xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedMeeting.minutesSummary}
                  </div>
                </div>

                {/* Action Items List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                      Enforceable Action Directives ({selectedMeeting.actionItems.length})
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {selectedMeeting.actionItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleActionItemStatus(selectedMeeting.id, item.id)}
                        className="cursor-pointer p-3.5 rounded-2xl bg-[#F0F4F9] border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={item.status === 'Completed'}
                            onChange={() => {}}
                            className="w-4 h-4 rounded border-slate-300 text-[#E31E24] focus:ring-[#E31E24]"
                          />
                          <div className={item.status === 'Completed' ? 'line-through text-[#718096]' : 'text-[#0B1F3A]'}>
                            <div className="font-bold">{item.task}</div>
                            <div className="text-[11px] text-[#718096] mt-0.5 tabular-nums">
                              Responsible: {item.assignee} • Due: {formatDateMMDDYYYY(item.dueDate)}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'In Progress'
                              ? 'bg-red-100 text-[#E31E24]'
                              : 'bg-slate-200 text-[#718096]'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add action item form */}
                  <div className="p-4 rounded-2xl bg-[#F0F4F9] border border-slate-200 space-y-2.5 text-xs">
                    <div className="font-bold text-[#0B1F3A]">Assign New Action Item</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Task description..."
                        value={newActionItem.task}
                        onChange={e => setNewActionItem({ ...newActionItem, task: e.target.value })}
                        className="sm:col-span-2 bg-white border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                      />
                      <input
                        type="text"
                        placeholder="Assignee"
                        value={newActionItem.assignee}
                        onChange={e => setNewActionItem({ ...newActionItem, assignee: e.target.value })}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#718096] font-medium whitespace-nowrap">Due Date:</span>
                        <div className="w-36">
                          <DateInput
                            value={newActionItem.dueDate}
                            onChange={val => setNewActionItem({ ...newActionItem, dueDate: val })}
                            ariaLabel="Action Item Due Date"
                            className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-[#0B1F3A] text-xs"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddActionItem(selectedMeeting.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-bold text-xs shadow-xs"
                      >
                        + Add Action
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-[#718096] border border-slate-200 rounded-3xl bg-white">
                Select a meeting on the left to review adopted agenda, minutes, and action items.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 2: Club Document Repository */}
      {activeSubTab === 'documents' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-[#718096] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search constitution, safeguarding, SAFA regulations..."
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#0B1F3A] placeholder-[#718096] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <select
                value={docCategoryFilter}
                onChange={e => setDocCategoryFilter(e.target.value)}
                className="bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
              >
                <option value="all">All Document Categories</option>
                <option value="Constitution & Bylaws">Constitution & Bylaws</option>
                <option value="SAFA Compliance">SAFA Compliance</option>
                <option value="Safeguarding">Safeguarding & Protection</option>
                <option value="Code of Conduct">Code of Conduct</option>
                <option value="Financial Statements">Financial Statements</option>
                <option value="Sponsorships">Sponsorship Contracts</option>
              </select>
            </div>

            <div className="text-xs text-[#718096] font-medium">
              Showing <strong className="text-[#0B1F3A]">{filteredDocs.length}</strong> archived instruments
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#E31E24] font-bold uppercase tracking-wider text-[10px]">
                      {doc.category}
                    </span>
                    <span className="text-[#718096] text-[11px] font-medium">{doc.fileSize} • {doc.fileFormat}</span>
                  </div>

                  <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] mt-3 mb-2 leading-snug uppercase tracking-wide">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-[#718096] leading-relaxed line-clamp-3 font-medium">
                    {doc.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] text-[#718096] font-medium bg-[#F0F4F9] px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-[#718096] font-medium">Updated: {doc.lastUpdated}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="px-3 py-1.5 rounded-xl bg-[#F0F4F9] hover:bg-slate-200 text-[#0B1F3A] text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button
                      onClick={() => showToast(`Document "${doc.downloadName}" downloaded.`)}
                      className="p-1.5 rounded-xl bg-red-50 text-[#E31E24] hover:bg-[#E31E24] hover:text-white transition-colors"
                      title="Download Document"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isAddMeetingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddMeetingOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-[#0B1F3A] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-2xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-wide">
                Convene Governance Meeting
              </h3>
              <p className="text-xs text-[#718096] mt-1 font-medium">
                Formal Executive Committee, AGM, or disciplinary council convening.
              </p>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Executive Board Strategic Planning"
                  value={meetingForm.title}
                  onChange={e => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Meeting Type</label>
                  <select
                    value={meetingForm.type}
                    onChange={e => setMeetingForm({ ...meetingForm, type: e.target.value as any })}
                    className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                  >
                    <option value="Executive Committee">Executive Committee</option>
                    <option value="Annual General Meeting (AGM)">Annual General Meeting (AGM)</option>
                    <option value="Coaches Council">Coaches Council</option>
                    <option value="Disciplinary Committee">Disciplinary Committee</option>
                    <option value="Finance Audit">Finance Audit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Status</label>
                  <select
                    value={meetingForm.status}
                    onChange={e => setMeetingForm({ ...meetingForm, status: e.target.value as any })}
                    className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Date (MM/DD/YYYY) *</label>
                  <DateInput
                    required
                    value={meetingForm.date}
                    onChange={val => setMeetingForm({ ...meetingForm, date: val })}
                    ariaLabel="Meeting Date"
                    className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Time</label>
                  <input
                    type="text"
                    value={meetingForm.time}
                    onChange={e => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Venue</label>
                <input
                  type="text"
                  value={meetingForm.venue}
                  onChange={e => setMeetingForm({ ...meetingForm, venue: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Agenda Items (One per line)</label>
                <textarea
                  rows={3}
                  value={meetingForm.agenda}
                  onChange={e => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl p-2.5 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMeetingOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F0F4F9] text-[#718096] text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold shadow-sm"
                >
                  Save Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsUploadDocOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-[#0B1F3A] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-2xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-wide">
                Deposit Official Document
              </h3>
              <p className="text-xs text-[#718096] mt-1 font-medium">
                Upload governance instrument, regulatory policy, or sponsor contract.
              </p>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026/27 SAFA Regional Player Compliance Mandate"
                  value={docForm.title}
                  onChange={e => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Category</label>
                <select
                  value={docForm.category}
                  onChange={e => setDocForm({ ...docForm, category: e.target.value as any })}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                >
                  <option value="Constitution & Bylaws">Constitution & Bylaws</option>
                  <option value="SAFA Compliance">SAFA Compliance</option>
                  <option value="Safeguarding">Safeguarding & Protection</option>
                  <option value="Code of Conduct">Code of Conduct</option>
                  <option value="Financial Statements">Financial Statements</option>
                  <option value="Sponsorships">Sponsorships</option>
                </select>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  placeholder="Summary of document purpose and authority..."
                  value={docForm.description}
                  onChange={e => setDocForm({ ...docForm, description: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl p-2.5 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Index Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. SAFA, Registration, Compliance"
                  value={docForm.tags}
                  onChange={e => setDocForm({ ...docForm, tags: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadDocOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F0F4F9] text-[#718096] text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold shadow-sm"
                >
                  Deposit & Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document View Preview Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setViewingDoc(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-[#0B1F3A] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#E31E24] font-bold uppercase tracking-wider text-[10px]">
                {viewingDoc.category}
              </span>
              <span className="text-[#718096] font-medium">• {viewingDoc.fileSize} ({viewingDoc.fileFormat})</span>
            </div>

            <h3 className="text-2xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-wide">
              {viewingDoc.title}
            </h3>

            <div className="bg-[#F0F4F9] p-5 rounded-2xl border border-slate-200 space-y-3 text-xs text-[#0B1F3A] leading-relaxed">
              <div className="text-[#E31E24] font-bold uppercase tracking-wider text-[10px]">
                Official Legal & Regulatory Summary
              </div>
              <p className="font-medium">{viewingDoc.description}</p>
              <div className="pt-2 border-t border-slate-200 text-[#718096] text-[11px] font-medium flex justify-between">
                <span>File: {viewingDoc.downloadName}</span>
                <span>Ratified: {viewingDoc.lastUpdated}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => {
                  deleteDocument(viewingDoc.id);
                  setViewingDoc(null);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                Delete Document
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 rounded-xl bg-[#F0F4F9] text-[#718096] text-xs font-semibold hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    showToast(`Downloading ${viewingDoc.downloadName}...`);
                    setViewingDoc(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
