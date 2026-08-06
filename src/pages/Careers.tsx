import { useState } from 'react';
import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle2, Zap, Heart, Coffee, Globe } from 'lucide-react';
import { toast } from 'sonner';

const JOBS = [
  { id: 1, title: 'Senior Woodwork & Product Designer', dept: 'Design', location: 'Bengaluru, KA', type: 'Full-time' },
  { id: 2, title: 'Supply Chain & Procurement Lead', dept: 'Operations', location: 'Bengaluru / Hybrid', type: 'Full-time' },
  { id: 3, title: 'Lead Frontend Engineer (React/Vite)', dept: 'Engineering', location: 'Remote / Bengaluru', type: 'Full-time' },
  { id: 4, title: 'Customer Experience Manager', dept: 'Support', location: 'Gurugram, HR', type: 'Full-time' },
  { id: 5, title: 'Interior Stylist & Merchandiser', dept: 'Creative', location: 'Mumbai, MH', type: 'Full-time' },
  { id: 6, title: 'Quality Assurance Auditor', dept: 'Manufacturing', location: 'Jodhpur, RJ', type: 'Full-time' },
];

export default function Careers() {
  const [selectedDept, setSelectedDept] = useState('All');
  const [applyingJob, setApplyingJob] = useState<string | null>(null);

  const departments = ['All', 'Design', 'Engineering', 'Operations', 'Creative', 'Support'];

  const filteredJobs = selectedDept === 'All' ? JOBS : JOBS.filter(j => j.dept === selectedDept);

  const handleApply = (title: string) => {
    setApplyingJob(title);
    setTimeout(() => {
      toast.success(`Application received for ${title}! Our HR team will reach out shortly.`);
      setApplyingJob(null);
    }, 800);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#172337] via-[#2874F0] to-blue-700 text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="bg-white/10 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
            Join Team WoodNest
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Build the Future of Modern Living</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            We are looking for creative thinkers, craftsmen, engineers, and visionaries to revolutionize home furniture ecommerce in India.
          </p>
        </div>
      </section>

      {/* Culture & Perks */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Why You'll Love Working Here</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: 'Fast-Paced Growth', desc: 'Accelerate your career with rapid responsibilities and mentorship.' },
            { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive medical insurance for you and your immediate family.' },
            { icon: Coffee, title: 'Flexible Work', desc: 'Hybrid and remote flexibility for selected roles with modern offices.' },
            { icon: Globe, title: 'Employee Discounts', desc: 'Exclusive discount vouchers on WoodNest furniture for your home.' },
          ].map((perk, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[#2874F0] flex items-center justify-center mx-auto mb-3">
                <perk.icon size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{perk.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{perk.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Openings */}
      <section className="max-w-5xl mx-auto px-4 py-8 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Open Roles</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Explore positions across our offices and remote teams</p>
          </div>
          {/* Department Filter */}
          <div className="flex flex-wrap gap-2">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedDept === dept
                    ? 'bg-[#2874F0] text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#2874F0] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-[#2874F0]">
                    {job.dept}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} />{job.type}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{job.title}</h3>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin size={13} /> {job.location}
                </div>
              </div>
              <button
                onClick={() => handleApply(job.title)}
                disabled={applyingJob === job.title}
                className="bg-[#2874F0] hover:bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                {applyingJob === job.title ? (
                  'Submitting...'
                ) : (
                  <>Apply Now <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
