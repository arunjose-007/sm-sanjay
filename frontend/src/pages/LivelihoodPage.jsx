import React, { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, Landmark, IndianRupee, Wrench, Search, Filter, ExternalLink, MapPin, Building, Award, CheckCircle, ChevronRight, X } from 'lucide-react';
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
  const [schemes, setSchemes] = useState([]);
  const [financial, setFinancial] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab, categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'jobs') {
        const res = await api.getJobs({
          search: searchQuery,
          category: categoryFilter !== 'All' ? categoryFilter : ''
        });
        setJobs(res.jobs || []);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-sky-500/30 text-xs sm:text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-emerald-400 uppercase tracking-widest font-bold">
            Module 01
          </span>
          <h2 className="text-sm sm:text-lg font-bold text-white">
            Livelihood Support
          </h2>
        </div>
      </div>

      {/* Hero Split Card matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/30 overflow-hidden shadow-2xl">
        
        {/* Left Side: 4 Feature Action Cards matching reference image */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <Landmark className="w-5 h-5" />
              </span>
              <span>Livelihood Support</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-300/80 mt-1">
              Empowering Lives with Opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* 1. Job Opportunities */}
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'jobs'
                  ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Job Opportunities</div>
                <div className="text-[11px] text-slate-400">Find nearby jobs</div>
              </div>
            </button>

            {/* 2. Government Schemes */}
            <button
              onClick={() => setActiveTab('schemes')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'schemes'
                  ? 'bg-purple-950/60 border-purple-400 shadow-lg shadow-purple-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Government Schemes</div>
                <div className="text-[11px] text-slate-400">Explore welfare schemes</div>
              </div>
            </button>

            {/* 3. Financial Assistance */}
            <button
              onClick={() => setActiveTab('financial')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'financial'
                  ? 'bg-amber-950/60 border-amber-400 shadow-lg shadow-amber-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Financial Assistance</div>
                <div className="text-[11px] text-slate-400">Get financial support</div>
              </div>
            </button>

            {/* 4. Skill Development */}
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                activeTab === 'skills'
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/80'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Skill Development</div>
                <div className="text-[11px] text-slate-400">Learn new skills</div>
              </div>
            </button>

          </div>
        </div>

        {/* Right Side: Scenic Hero Illustration matching screenshot */}
        <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-xl border border-emerald-500/20 relative min-h-[220px]">
          <FarmerIllustration className="w-full h-full min-h-[220px]" />
        </div>

      </div>

      {/* Filter and Search Bar for active section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white"
          />
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['All', 'Agriculture', 'Driving', 'Fishery', 'Skill & Energy', 'Rural Livelihood'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Dynamic Content Display */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Loading records from local SQLite database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* TAB 1: JOBS */}
          {activeTab === 'jobs' && jobs.map((job) => (
            <div
              key={job.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/50 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {job.category}
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    {job.salary}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white hover:text-emerald-300 transition">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-900/80 text-[11px] text-slate-300 border border-slate-800">
                  <span className="font-semibold text-emerald-400">Eligibility: </span>
                  {job.eligibility}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {job.contact}
                </span>
                <button
                  onClick={() => setSelectedItem(job)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-emerald-600/30 transition"
                >
                  <span>Apply Now</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* TAB 2: GOVERNMENT SCHEMES */}
          {activeTab === 'schemes' && schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block">
                  {scheme.category}
                </span>

                <h3 className="text-base font-bold text-white">
                  {scheme.title}
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/20 text-purple-200">
                    <span className="font-bold text-purple-300">Benefits: </span>
                    {scheme.benefits}
                  </div>

                  <div className="text-slate-300">
                    <span className="font-semibold text-slate-200">Eligibility: </span>
                    {scheme.eligibility}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setSelectedItem(scheme)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                >
                  View Application Steps
                </button>
                {scheme.official_link && (
                  <a
                    href={scheme.official_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* TAB 3: FINANCIAL ASSISTANCE */}
          {activeTab === 'financial' && financial.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-amber-500/50 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-sm">
                  {item.assistance_amount}
                </div>

                <h3 className="text-base font-bold text-white">
                  {item.program_name}
                </h3>

                <div className="text-xs text-slate-400">
                  <span className="text-slate-300 font-medium">Provided by: </span>
                  {item.provider}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 text-xs text-slate-300 border border-slate-800 space-y-1.5">
                  <div>
                    <span className="font-semibold text-amber-400">Eligibility: </span>
                    {item.eligibility}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">How to Apply: </span>
                    {item.application_info}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                >
                  View Details & Guidance
                </button>
              </div>
            </div>
          ))}

          {/* TAB 4: SKILL DEVELOPMENT */}
          {activeTab === 'skills' && skills.map((course) => (
            <div
              key={course.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/50 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {course.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {course.duration}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">
                  {course.course_title}
                </h3>

                <div className="text-xs text-slate-400">
                  <span className="text-slate-300 font-medium">Training Body: </span>
                  {course.provider}
                </div>

                <div className="text-xs text-slate-400">
                  <span className="text-slate-300 font-medium">Training Mode: </span>
                  <span className="text-emerald-400 font-semibold">{course.mode}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  {course.learning_resources}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => setSelectedItem(course)}
                  className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Enroll / Syllabus Details
                </button>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-2xl border border-sky-500/40 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white pr-8">
              {selectedItem.title || selectedItem.program_name || selectedItem.course_title}
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 max-h-96 overflow-y-auto pr-2">
              {selectedItem.company && (
                <p><b>Company:</b> {selectedItem.company}</p>
              )}
              {selectedItem.location && (
                <p><b>Location:</b> {selectedItem.location}</p>
              )}
              {selectedItem.salary && (
                <p><b>Remuneration:</b> <span className="text-amber-400 font-bold">{selectedItem.salary}</span></p>
              )}
              {selectedItem.eligibility && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-emerald-400 block mb-1">Eligibility Criteria:</span>
                  {selectedItem.eligibility}
                </div>
              )}
              {selectedItem.benefits && (
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30">
                  <span className="font-bold text-purple-300 block mb-1">Scheme Benefits:</span>
                  {selectedItem.benefits}
                </div>
              )}
              {selectedItem.application_procedure && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-sky-400 block mb-1">How to Apply:</span>
                  {selectedItem.application_procedure}
                </div>
              )}
              {selectedItem.contact && (
                <p><b>Contact / Submission:</b> <span className="font-mono text-sky-400">{selectedItem.contact}</span></p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Dock with 4 Buttons */}
      <ActionDock
        onOpenAI={onOpenAI}
        onOpenSOS={onOpenSOS}
        onOpenMap={onOpenMap}
        onOpenWeather={onOpenWeather}
      />

    </div>
  );
}
