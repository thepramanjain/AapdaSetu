import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Calendar,
} from 'lucide-react';

import { useReports } from '../hooks/useApi';
import { Card } from '../components/Card';
import { SectionTitle } from '../components/SectionTitle';

const Reports: React.FC = () => {
  const { data: reports, isLoading } = useReports();
  const [activeTab, setActiveTab] = useState<'all' | 'Government' | 'NGO' | 'Public'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDownload = (title: string) => {
    alert(`Downloading report digest: "${title}" in PDF format.`);
  };

  const handlePrint = (title: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print - ${title}</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 40px; color: #111; }
              .header { border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; }
              .meta { font-size: 12px; color: #555; margin-top: 10px; }
              .body { line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${title}</div>
              <div class="meta">AapdaSetu Platform • Verified Document</div>
            </div>
            <div class="body">
              <h3>Report Digest</h3>
              <p>This report has been compiled and verified by the AapdaSetu coordinator agent.</p>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const filteredReports = reports?.filter(rep => {
    const matchesTab = activeTab === 'all' || rep.category === activeTab;
    const matchesSearch = rep.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rep.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="pt-28 pb-20 mx-auto max-w-7xl px-4 sm:px-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <SectionTitle 
          subtitle="Intelligence Archives" 
          title="Reports Vault" 
          description="Access, download, or print verified publications compiled by administrative agency networks."
        />
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-sm">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input text-xs pl-9 pr-4 py-2 w-full md:max-w-md"
          />
        </div>

        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs self-start md:self-auto font-mono">
          {(['all', 'Government', 'NGO', 'Public'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md uppercase text-[9px] font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-[210px] rounded-xl bg-slate-100 animate-pulse" />
          ))
        ) : (
          filteredReports?.map((rep) => (
            <Card key={rep.id} className="p-6 h-[210px] flex flex-col justify-between hover:shadow-card-hover transition-shadow">
              
              <div>
                <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-mono font-bold bg-emerald-50 border border-emerald-100 rounded px-2.5 py-0.5 text-emerald-600 uppercase">
                    {rep.category}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{rep.date}</span>
                  </div>
                </div>
                <h3 className="font-heading font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug mb-1.5" title={rep.title}>
                  {rep.title}
                </h3>
                <span className="text-[10px] text-slate-500 font-medium block truncate font-mono">Author: {rep.author}</span>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between font-mono text-[10px] text-slate-400 select-none">
                <span>SIZE: {rep.size}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePrint(rep.title)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors hover:bg-slate-50 rounded border border-slate-200 hover:border-slate-300"
                    title="Print Document"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDownload(rep.title)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors hover:bg-slate-50 rounded border border-slate-200 hover:border-slate-300"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </Card>
          ))
        )}

        {filteredReports?.length === 0 && (
          <div className="col-span-full py-12 text-center flex flex-col items-center justify-center">
            <FileText className="w-8 h-8 text-slate-300 mb-2" />
            <span className="text-xs text-slate-500 font-mono">No documents match the selected filter</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
