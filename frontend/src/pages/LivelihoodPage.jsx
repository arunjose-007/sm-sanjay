import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Briefcase, Landmark, IndianRupee, Wrench, Search, Filter, 
  ExternalLink, MapPin, Building, Award, CheckCircle, ChevronRight, X, 
  Sparkles, Globe, UserCheck, ShieldCheck, ArrowUpRight 
} from 'lucide-react';
import { FarmerIllustration } from '../assets/illustrations';
import { api } from '../services/api';
import ActionDock from '../components/ActionDock';

export default function LivelihoodPage({
  onBack,
  onOpenAI,
  onOpenSOS,
  onOpenMap,
  onOpenWeather
}) {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'schemes' | 'financial' | 'skills'
  const [jobs, setJobs] = useState([]);
  const [portals, setPortals] = useState([]);
  const [portalSearchLinks, setPortalSearchLinks] = useState({});
  const [schemes, setSchemes] = useState([]);
  const [financial, setFinancial] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Job Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('Tamil Nadu');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('all'); // 'all' | 'fresher' | 'experienced'
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Sector categories as specified
  const jobCategories = [
    'All',
    'Driving',
    'Agriculture',
    'Fishing',
    'IT',
    'Engineering',
    'General'
  ];

  useEffect(() => {
    loadData();
  }, [activeTab, categoryFilter, experienceFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'jobs') {
        const res = await api.getJobs({
          search: searchQuery,
          category: categoryFilter !== 'All' ? categoryFilter : '',
          location: locationQuery !== 'All' ? locationQuery : '',
          experience: experienceFilter !== 'all' ? experienceFilter : ''
        });
        setJobs(res.jobs || []);
        setPortals(res.official_portals || []);
        setPortalSearchLinks(res.portal_search_links || {});
      } else if (activeTab === 'schemes') {
        const res = await api.getSchemes(categoryFilter !== 'All' ? categoryFilter : '');
        setSchemes(res.schemes || []);
      } else if (activeTab === 'financial') {
        const res = await api.getFinancialAssistance();
        setFinancial(res.programs || []);
      } else if (activeTab === 'skills') {
        const res = await api.getSkillDevelopment(categoryFilter !== 'All' ? categoryFilter : '');
        setSkills(res.courses || []);
      }
    } catch (e) {
      console.warn("Failed loading livelihood data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 text-xs sm:text-sm font-bold transition shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-emerald-400 uppercase tracking-widest font-extrabold">
            Section 01
          </span>
          <h2 className="text-sm sm:text-lg font-bold text-white">
            Livelihood & Employment Hub
          </h2>
        </div>
      </div>

      {/* Hero Split Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass-panel rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 overflow-hidden shadow-2xl relative">
        
        {/* Left Side: 4 Feature Action Cards matching reference UI */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Genuine Employment & Welfare Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-lg">
                <Landmark className="w-6 h-6" />
              </span>
              <span>Livelihood Support</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-300/80 mt-1">
              Empowering Lives with Real Career Opportunities & Government Welfare
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* 1. Job Opportunities */}
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                activeTab === 'jobs'
                  ? 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02]'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Job Opportunities</div>
                <div className="text-[11px] text-emerald-300/80 font-medium">Real trusted portals</div>
              </div>
            </button>

            {/* 2. Government Schemes */}
            <button
              onClick={() => setActiveTab('schemes')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                activeTab === 'schemes'
                  ? 'bg-purple-950/70 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)] scale-[1.02]'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Government Schemes</div>
                <div className="text-[11px] text-purple-300/80 font-medium">PM-KISAN, PMMSY...</div>
              </div>
            </button>

            {/* 3. Financial Assistance */}
            <button
              onClick={() => setActiveTab('financial')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                activeTab === 'financial'
                  ? 'bg-amber-950/70 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02]'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Financial Assistance</div>
                <div className="text-[11px] text-amber-300/80 font-medium">Subsidies & Grants</div>
              </div>
            </button>

            {/* 4. Skill Development */}
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                activeTab === 'skills'
                  ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.02]'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Skill Development</div>
                <div className="text-[11px] text-cyan-300/80 font-medium">Free PMKVY courses</div>
              </div>
            </button>

          </div>
        </div>

        {/* Right Side: Scenic Hero Illustration matching UI */}
        <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20 relative min-h-[220px]">
          <FarmerIllustration className="w-full h-full min-h-[220px] object-cover" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DEDICATED REAL JOB OPPORTUNITIES SECTION                 */}
      {/* ============================================================== */}
      {activeTab === 'jobs' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Real Job Search & Filter Console */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  <span>Real Job Search & Application Portal</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Search across verified career platforms: <b>Naukri, LinkedIn Jobs, Indeed India, National Career Service, Apna, and Freshersworld</b>.
                </p>
              </div>

              {/* Experience Filter: Freshers vs Experienced */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setExperienceFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${experienceFilter === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  All Candidates
                </button>
                <button
                  type="button"
                  onClick={() => setExperienceFilter('fresher')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${experienceFilter === 'fresher' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Freshers
                </button>
                <button
                  type="button"
                  onClick={() => setExperienceFilter('experienced')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${experienceFilter === 'experienced' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Experienced
                </button>
              </div>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleJobSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Job title or skills (e.g. Driver, Agri Drone, Electrician, Web Dev)..."
                  className="w-full glass-input rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-white"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>

              <div className="sm:col-span-4 relative">
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Location (e.g. Chennai, Salem, Coimbatore, Tamil Nadu)..."
                  className="w-full glass-input rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-white"
                />
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full h-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/30 transition active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Jobs</span>
                </button>
              </div>
            </form>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-emerald-400" /> Sectors:
              </span>
              {jobCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 6 Official Trusted Job Platforms Grid with Live Search Redirects */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Official Trusted Job Portals (Click to Search & Apply Directly)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portals.map((portal) => {
                const targetUrl = portalSearchLinks[portal.id] || portal.base_url;
                return (
                  <div
                    key={portal.id}
                    className="glass-card rounded-2xl p-4 border border-slate-700/80 hover:border-emerald-400/60 transition flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="text-sm font-black text-white group-hover:text-emerald-300 transition">
                            {portal.name}
                          </h5>
                          <span className="text-[10px] text-cyan-400 font-semibold">{portal.tagline}</span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-emerald-500/30">
                          {portal.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300/80 leading-relaxed">
                        {portal.description}
                      </p>
                    </div>

                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition group-hover:scale-[1.02]"
                    >
                      <span>Search & Apply on {portal.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Curated Verified Opportunities with Apply Now buttons */}
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Curated Opportunities with Verified Direct Portal Links ({jobs.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-card rounded-2xl p-5 border border-emerald-500/30 hover:border-emerald-400/60 transition flex flex-col justify-between space-y-3 shadow-xl group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition">
                          {job.title}
                        </h4>
                        <div className="text-xs font-semibold text-slate-400 flex items-center gap-2 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{job.company}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 shrink-0">
                        {job.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-1 text-emerald-300 font-bold">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-cyan-300 font-semibold border border-slate-700">
                        {job.experience_level}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <b>Eligibility:</b> {job.eligibility}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      Verified on <b>{job.platform}</b>
                    </span>

                    <a
                      href={job.direct_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition group-hover:scale-105"
                    >
                      <span>Apply on {job.platform}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: GOVERNMENT WELFARE SCHEMES                               */}
      {/* ============================================================== */}
      {activeTab === 'schemes' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Central & State Welfare Schemes ({schemes.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemes.map((s) => (
              <div
                key={s.id}
                className="glass-card rounded-2xl p-5 border border-purple-500/30 hover:border-purple-400/60 transition space-y-3 shadow-lg"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-base font-bold text-white">{s.title}</h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
                    {s.category}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1.5">
                  <p><b>Benefits:</b> {s.benefits}</p>
                  <p className="text-slate-400"><b>Eligibility:</b> {s.eligibility}</p>
                  <p className="text-slate-400"><b>How to Apply:</b> {s.application_procedure}</p>
                </div>

                {s.official_link && (
                  <a
                    href={s.official_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 underline"
                  >
                    <span>Official Government Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: FINANCIAL ASSISTANCE & SUBSIDIES                         */}
      {/* ============================================================== */}
      {activeTab === 'financial' && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Subsidies, Low-Interest Credit & Grants ({financial.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {financial.map((f) => (
              <div
                key={f.id}
                className="glass-card rounded-2xl p-5 border border-amber-500/30 hover:border-amber-400/60 transition space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">{f.program_name}</h4>
                  <div className="text-xs font-semibold text-amber-300">{f.provider}</div>
                  <div className="text-xs text-slate-300"><b>Amount / Subsidy:</b> {f.amount_or_subsidy}</div>
                  <p className="text-xs text-slate-400">{f.eligibility_criteria}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <span>Contact: {f.contact_info}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: VOCATIONAL SKILL DEVELOPMENT                             */}
      {/* ============================================================== */}
      {activeTab === 'skills' && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            PMKVY & Vocational Certification Courses ({skills.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((c) => (
              <div
                key={c.id}
                className="glass-card rounded-2xl p-5 border border-cyan-500/30 hover:border-cyan-400/60 transition space-y-2 shadow-lg"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-base font-bold text-white">{c.course_name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    {c.sector}
                  </span>
                </div>
                <div className="text-xs text-slate-300"><b>Institution:</b> {c.institution}</div>
                <div className="text-xs text-slate-400"><b>Duration:</b> {c.duration} • <b>Mode:</b> {c.mode}</div>
                {c.certification && (
                  <div className="text-xs text-emerald-400 font-semibold">
                    ✓ Certificate: {c.certification}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 Bottom Action Buttons */}
      <ActionDock
        onOpenAI={onOpenAI}
        onOpenSOS={onOpenSOS}
        onOpenMap={onOpenMap}
        onOpenWeather={onOpenWeather}
      />

    </div>
  );
}
