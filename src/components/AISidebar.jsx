import { Home, BookOpen, Bot, FileText, BarChart, Library, Settings } from 'lucide-react';

const AISidebar = () => (
  <div className="w-20 bg-slate-900 flex flex-col items-center py-8 gap-8 border-r border-slate-800">
    <div className="text-blue-500 font-bold text-xl mb-4">S</div>
    {[Home, BookOpen, Bot, FileText, BarChart, Library, Settings].map((Icon, i) => (
      <Icon key={i} className="text-slate-400 hover:text-blue-500 cursor-pointer" />
    ))}
  </div>
);

export default AISidebar;