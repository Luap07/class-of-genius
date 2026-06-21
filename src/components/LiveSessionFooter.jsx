import { Mic, Square } from 'lucide-react';

const LiveSessionFooter = () => (
  <div className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-slate-800">
    <div className="flex gap-8">
      <div>Study Time: 2h 45m</div>
      <div>Questions: 24</div>
    </div>
    <div className="flex gap-4">
      <button className="bg-blue-600 p-3 rounded-full"><Mic /></button>
      <button className="bg-slate-700 p-3 rounded-full"><Square /></button>
    </div>
    <div>Accuracy: 87% | Rank: Top 15%</div>
  </div>
);
export default LiveSessionFooter;