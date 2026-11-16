import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Briefcase, Landmark, IndianRupee, Wrench, Anchor, AlertTriangle, PhoneCall, Trash2, Plus, ArrowLeft, RefreshCw, X, Check } from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboardPage({ onBack, currentUser }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [faList, setFaList] = useState([]);
  const [skills, setSkills] = useState([]);
  const [fishingAlerts, setFishingAlerts] = useState([]);
  const [roadAlerts, setRoadAlerts] = useState([]);
  const [emergencyReports, setEmergencyReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('job');
  const [formData, setFormData] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadAll();
  }, [activeTab]);

  const loadAll = async () => {
    setLoading(true);
    setMsg('');
    try {
      if (activeTab === 'stats') {
        const s = await api.getAdminStats();
        setStats(s);
      } else if (activeTab === 'users') {
        const u = await api.getAdminUsers();
        setUsers(u.users || []);
      } else if (activeTab === 'jobs') {
        const j = await api.getJobs();
        setJobs(j.jobs || []);
      } else if (activeTab === 'schemes') {
        const sc = await api.getSchemes();
        setSchemes(sc.schemes || []);
      } else if (activeTab === 'financial') {
        const f = await api.getFinancialAssistance();
        setFaList(f.programs || []);
      } else if (activeTab === 'skills') {
        const sk = await api.getSkillDevelopment();
        setSkills(sk.courses || []);
      } else if (activeTab === 'fishing_alerts') {
        const fa = await api.getFishingAlerts();
        setFishingAlerts(fa.alerts || []);
      } else if (activeTab === 'road_alerts') {
        const ra = await api.getRoadAlerts();
        setRoadAlerts(ra.alerts || []);
      } else if (activeTab === 'sos') {
        const rep = await api.getAdminEmergencyReports();
        setEmergencyReports(rep.reports || []);
      }
    } catch (e) {
      console.warn("Admin fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      if (type === 'user') await api.deleteUser(id);
      if (type === 'job') await api.deleteJob(id);
      if (type === 'scheme') await api.deleteScheme(id);
      if (type === 'financial') await api.deleteFinancialAssistance(id);
      if (type === 'skill') await api.deleteSkill(id);
      if (type === 'fishing_alert') await api.deleteFishingAlert(id);
      if (type === 'road_alert') await api.deleteRoadAlert(id);
      setMsg("Record deleted successfully.");
      loadAll();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  const handleOpenAdd = (type) => {
    setModalType(type);
    setFormData({});
    setShowAddModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'job') await api.addJob(formData);
      if (modalType === 'scheme') await api.addScheme(formData);
      if (modalType === 'financial') await api.addFinancialAssistance(formData);
      if (modalType === 'skill') await api.addSkill(formData);
      if (modalType === 'fishing_alert') await api.addFishingAlert(formData);
      if (modalType === 'road_alert') await api.addRoadAlert(formData);

      setShowAddModal(false);
      setMsg("New record created successfully in SQLite database.");
      loadAll();
    } catch (err) {
      alert(err.message || "Creation failed");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-sky-500/30 text-xs sm:text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">Administrator Control Center</h1>
            <p className="text-[11px] text-amber-300">Authorized: {currentUser?.username || 'admin'}</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
        {[
          { id: 'stats', label: 'System Overview', icon: ShieldAlert },
          { id: 'users', label: 'Registered Users', icon: Users },
          { id: 'jobs', label: 'Jobs', icon: Briefcase },
          { id: 'schemes', label: 'Govt Schemes', icon: Landmark },
          { id: 'financial', label: 'Financial Aid', icon: IndianRupee },
          { id: 'skills', label: 'Skill Training', icon: Wrench },
          { id: 'fishing_alerts', label: 'Marine Alerts', icon: Anchor },
          { id: 'road_alerts', label: 'Road Alerts', icon: AlertTriangle },
          { id: 'sos', label: 'Emergency Reports', icon: PhoneCall },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap font-medium transition ${
                activeTab === t.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Stats Summary */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          {[
            { label: 'Registered Users', val: stats.users_count, color: 'text-sky-400' },
            { label: 'Job Opportunities', val: stats.jobs_count, color: 'text-emerald-400' },
            { label: 'Government Schemes', val: stats.schemes_count, color: 'text-purple-400' },
            { label: 'Financial Aid Programs', val: stats.financial_assistance_count, color: 'text-amber-400' },
            { label: 'Skill Programs', val: stats.skill_programs_count, color: 'text-cyan-400' },
            { label: 'Fishing Safety Alerts', val: stats.fishing_alerts_count, color: 'text-blue-400' },
            { label: 'Road Alerts', val: stats.road_alerts_count, color: 'text-rose-400' },
            { label: 'Emergency SOS Logs', val: stats.emergency_reports_count, color: 'text-red-500' },
          ].map((s, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">{s.label}</span>
              <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Registered Users */}
      {activeTab === 'users' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">User Accounts ({users.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Username</th>
                  <th className="p-2">Full Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Created</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/60">
                    <td className="p-2">{u.id}</td>
                    <td className="p-2 font-bold text-white">{u.username}</td>
                    <td className="p-2">{u.full_name}</td>
                    <td className="p-2 text-slate-400">{u.email}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-2 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-2 text-right">
                      {u.username !== 'admin' && (
                        <button
                          onClick={() => handleDelete('user', u.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Jobs */}
      {activeTab === 'jobs' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Job Postings ({jobs.length})</h3>
            <button
              onClick={() => handleOpenAdd('job')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Job
            </button>
          </div>
          <div className="space-y-2">
            {jobs.map(j => (
              <div key={j.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{j.title} • <span className="text-amber-400">{j.salary}</span></div>
                  <div className="text-slate-400">{j.company} - {j.location} ({j.category})</div>
                </div>
                <button
                  onClick={() => handleDelete('job', j.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Schemes */}
      {activeTab === 'schemes' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Government Welfare Schemes ({schemes.length})</h3>
            <button
              onClick={() => handleOpenAdd('scheme')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Scheme
            </button>
          </div>
          <div className="space-y-2">
            {schemes.map(s => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{s.title} ({s.category})</div>
                  <div className="text-slate-400 text-[11px] truncate max-w-lg">{s.benefits}</div>
                </div>
                <button
                  onClick={() => handleDelete('scheme', s.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Emergency Reports */}
      {activeTab === 'sos' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Emergency SOS Incident Log ({emergencyReports.length})</h3>
          <div className="space-y-2">
            {emergencyReports.map(rep => (
              <div key={rep.id} className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start justify-between text-xs">
                <div>
                  <div className="font-bold text-red-300">Report #{rep.id} - {rep.status}</div>
                  <div className="text-white font-mono text-[11px]">GPS: {rep.latitude.toFixed(5)}, {rep.longitude.toFixed(5)}</div>
                  <div className="text-slate-300 mt-1">{rep.message}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{new Date(rep.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel p-6 rounded-2xl border border-amber-500/40 shadow-2xl space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white">
              Add New {modalType.replace('_', ' ').toUpperCase()}
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              {modalType === 'job' && (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Job Title"
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Company"
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Category (e.g. Driving, Agriculture, Fishery)"
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Location"
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Salary"
                    onChange={e => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5"
                  />
                  <textarea
                    required
                    placeholder="Eligibility Criteria"
                    onChange={e => setFormData({ ...formData, eligibility: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 h-16"
                  />
                  <textarea
                    required
                    placeholder="Job Description"
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 h-16"
                  />
                  <input
                    type="text"
                    placeholder="Contact Email / Phone"
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5"
                  />
                </>
              )}

              {modalType === 'scheme' && (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Scheme Title"
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Category"
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5"
                  />
                  <textarea
                    required
                    placeholder="Eligibility"
                    onChange={e => setFormData({ ...formData, eligibility: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 h-16"
                  />
                  <textarea
                    required
                    placeholder="Benefits"
                    onChange={e => setFormData({ ...formData, benefits: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 h-16"
                  />
                  <textarea
                    required
                    placeholder="Application Procedure"
                    onChange={e => setFormData({ ...formData, application_procedure: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 h-16"
                  />
                  <input
                    type="text"
                    placeholder="Official Portal Link"
                    onChange={e => setFormData({ ...formData, official_link: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5"
                  />
                </>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition"
              >
                Save Record to SQLite
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
