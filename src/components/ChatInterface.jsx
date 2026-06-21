const ChatInterface = () => (
  <div className="w-1/3 bg-slate-900 rounded-xl p-6 border border-slate-800 flex flex-col gap-4">
    <div className="flex-1 overflow-y-auto space-y-4">
      <div className="bg-slate-800 p-3 rounded-lg text-sm">Factorization means breaking an expression...</div>
      <div className="bg-blue-900/20 p-3 rounded-lg text-sm text-right">Yes, show me a practice question.</div>
    </div>
    <input type="text" placeholder="Type your message..." className="bg-slate-800 p-3 rounded-lg w-full outline-none" />
  </div>
);
export default ChatInterface;