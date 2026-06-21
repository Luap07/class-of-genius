const LessonProgress = () => (
  <div className="w-64 bg-slate-900 rounded-xl p-6 border border-slate-800">
    <h3 className="font-bold">Mathematics</h3>
    <div className="my-6 h-24 w-24 rounded-full border-4 border-blue-500 flex items-center justify-center mx-auto">
      65%
    </div>
    <div className="space-y-2 text-sm">
      <p className="text-blue-500">● Quadratic Eq.</p>
      <p className="text-slate-400">Factorization</p>
    </div>
  </div>
);
export default LessonProgress;