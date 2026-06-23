import React, { useEffect, useState } from "react";

const SettingsPanel = () => {
  const [voice, setVoice] = useState("female");
  const [language, setLanguage] = useState("English");

  // Load saved settings
  useEffect(() => {
    const savedVoice = localStorage.getItem("ai_voice");
    const savedLanguage = localStorage.getItem("ai_language");

    if (savedVoice) setVoice(savedVoice);
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  // Save voice
  useEffect(() => {
    localStorage.setItem("ai_voice", voice);
  }, [voice]);

  // Save language
  useEffect(() => {
    localStorage.setItem("ai_language", language);
  }, [language]);

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-4">
        ⚙️ Settings
      </h2>

      {/* Voice */}
      <div className="bg-slate-900 p-4 rounded-xl mb-4">
        <p className="mb-2">🎤 Voice</p>

        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          className="w-full p-2 bg-slate-800 rounded-lg"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <p className="mt-2 text-sm text-slate-400">
          Current: {voice}
        </p>
      </div>

      {/* Language */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <p className="mb-2">🌍 Language</p>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 bg-slate-800 rounded-lg"
        >
          <option value="English">English</option>
          <option value="French">French</option>
          <option value="Spanish">Spanish</option>
                         
        </select>

        <p className="mt-2 text-sm text-slate-400">
          Current: {language}
        </p>
      </div>
    </div>
  );
};

export default SettingsPanel;