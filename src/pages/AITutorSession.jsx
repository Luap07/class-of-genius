import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Square,
  MessageCircle,
  BookOpen,
  TrendingUp,
  Settings,
  ChevronDown,
  Bot,
  User,
  Loader2,
  Volume2,
  VolumeX,
  RotateCcw,
  Lightbulb,
  GraduationCap,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import AITutorDisplay from "../components/AITutorDisplay";
import AITutorHeader from "../components/AITutorHeader";
import AITutorSidebar from "../components/AITutorSidebar";
import SubjectsPanel from "../panels/SubjectsPanel";
import ProgressPanel from "../panels/ProgressPanel";
import SettingsPanel from "../panels/SettingsPanel";
import MathText from "../components/MathText";

const AITutorSession = () => {
  const [params] = useSearchParams();

  const classType = params.get("class") || "WAEC";

  // ============================================================
  // STATE
  // ============================================================

  const [sessionMode, setSessionMode] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activePanel, setActivePanel] = useState("home");

  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [currentSubject, setCurrentSubject] =
    useState("General");

  const [currentTopic, setCurrentTopic] =
    useState("Introduction");

  const [showSubjectMenu, setShowSubjectMenu] =
    useState(false);

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  // ============================================================
  // REFS
  // ============================================================

  const recognitionRef = useRef(null);
  const isActiveRef = useRef(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ============================================================
  // SUBJECTS
  // ============================================================

  const subjects = [
    "General",
    "Mathematics",
    "English Language",
    "Physics",
    "Chemistry",
    "Biology",
    "Financial Accounting",
    "Economics",
    "Government",
    "Agricultural Science",
    "Literature",
  ];

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  // ============================================================
  // PROGRESS
  // ============================================================

  const updateProgress = async (subject, topic) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const storageKey =
        `studentProgress_${user.id}`;

      let saved;

      try {
        saved =
          JSON.parse(
            localStorage.getItem(storageKey)
          ) || {
            subjects: {},
          };
      } catch {
        saved = {
          subjects: {},
        };
      }

      if (!saved.subjects) {
        saved.subjects = {};
      }

      if (!saved.subjects[subject]) {
        saved.subjects[subject] = {
          topics: {},
        };
      }

      if (
        !saved.subjects[subject].topics[topic]
      ) {
        saved.subjects[subject].topics[topic] = {
          completed: 0,
          total: 10,
        };
      }

      saved.subjects[subject].topics[
        topic
      ].completed += 1;

      saved.subjects[subject].topics[
        topic
      ].completed = Math.min(
        saved.subjects[subject].topics[topic]
          .completed,
        saved.subjects[subject].topics[topic]
          .total
      );

      localStorage.setItem(
        storageKey,
        JSON.stringify(saved)
      );

      const today = new Date().getDay();

      const dayIndex =
        today === 0 ? 6 : today - 1;

      const weekStorageKey =
        `studentWeeklyProgress_${user.id}`;

      let savedWeek;

      try {
        savedWeek =
          JSON.parse(
            localStorage.getItem(
              weekStorageKey
            )
          ) || {
            weekData: [0, 0, 0, 0, 0, 0, 0],
          };
      } catch {
        savedWeek = {
          weekData: [0, 0, 0, 0, 0, 0, 0],
        };
      }

      if (!Array.isArray(savedWeek.weekData)) {
        savedWeek.weekData = [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ];
      }

      savedWeek.weekData[dayIndex] =
        Math.min(
          (savedWeek.weekData[dayIndex] ||
            0) + 5,
          100
        );

      localStorage.setItem(
        weekStorageKey,
        JSON.stringify(savedWeek)
      );

      window.dispatchEvent(
        new Event("storage-update")
      );
    } catch (error) {
      console.error(
        "Progress update failed:",
        error
      );
    }
  };

  // ============================================================
  // SUBJECT + TOPIC DETECTION
  // ============================================================

  const detectSubjectAndTopic = (text) => {
    const t = text.toLowerCase();

    if (
      t.includes("fraction") ||
      t.includes("numerator") ||
      t.includes("denominator")
    ) {
      return {
        subject: "Mathematics",
        topic: "Fractions",
      };
    }

    if (
      t.includes("algebra") ||
      t.includes("equation") ||
      t.includes("quadratic") ||
      t.includes("linear equation")
    ) {
      return {
        subject: "Mathematics",
        topic: "Algebra",
      };
    }

    if (
      t.includes("photosynthesis") ||
      t.includes("biology") ||
      t.includes("cell") ||
      t.includes("organism") ||
      t.includes("mitosis") ||
      t.includes("genetics")
    ) {
      return {
        subject: "Biology",
        topic: t.includes("photosynthesis")
          ? "Photosynthesis"
          : "Cell Biology",
      };
    }

    if (
      t.includes("physics") ||
      t.includes("force") ||
      t.includes("motion") ||
      t.includes("velocity") ||
      t.includes("acceleration") ||
      t.includes("energy")
    ) {
      return {
        subject: "Physics",
        topic: "Motion",
      };
    }

    if (
      t.includes("chemistry") ||
      t.includes("mole") ||
      t.includes("chemical") ||
      t.includes("atom") ||
      t.includes("element")
    ) {
      return {
        subject: "Chemistry",
        topic: "Chemistry Fundamentals",
      };
    }

    if (
      t.includes("accounting") ||
      t.includes("ledger") ||
      t.includes("journal") ||
      t.includes("balance sheet")
    ) {
      return {
        subject: "Financial Accounting",
        topic: "Accounting Fundamentals",
      };
    }

    if (
      t.includes("economics") ||
      t.includes("demand") ||
      t.includes("supply") ||
      t.includes("inflation")
    ) {
      return {
        subject: "Economics",
        topic: "Economics Fundamentals",
      };
    }

    if (
      t.includes("government") ||
      t.includes("constitution") ||
      t.includes("democracy") ||
      t.includes("politics")
    ) {
      return {
        subject: "Government",
        topic: "Government Fundamentals",
      };
    }

    if (
      t.includes("agriculture") ||
      t.includes("crop") ||
      t.includes("livestock") ||
      t.includes("farm")
    ) {
      return {
        subject: "Agricultural Science",
        topic: "Agriculture Fundamentals",
      };
    }

    return {
      subject: currentSubject,
      topic: currentTopic,
    };
  };

  // ============================================================
  // SPEECH RECOGNITION
  // ============================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn(
        "Speech Recognition is not supported in this browser."
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (
        isActiveRef.current &&
        !isAISpeaking
      ) {
        try {
          recognition.start();
        } catch {
          // Already running.
        }
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const result =
        event.results[event.resultIndex];

      const text =
        result?.[0]?.transcript?.trim();

      if (
        result?.isFinal &&
        text &&
        !isAISpeaking
      ) {
        handleUserSpeak(text);
      }
    };

    recognitionRef.current =
      recognition;

    return () => {
      isActiveRef.current = false;

      try {
        recognition.stop();
      } catch {
        // Ignore.
      }
    };
  }, [isAISpeaking]);

  // ============================================================
  // SPEAK MODE
  // ============================================================

  const startSpeak = () => {
    if (!recognitionRef.current) {
      alert(
        "Voice recognition is not supported in this browser. Please use Chrome."
      );
      return;
    }

    setSessionMode("speak");

    isActiveRef.current = true;

    try {
      recognitionRef.current.start();
    } catch {
      // Already running.
    }
  };

  const stopSpeak = () => {
    isActiveRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore.
    }

    window.speechSynthesis.cancel();

    setIsListening(false);
    setIsAISpeaking(false);
    setSessionMode("idle");
  };

  const startWrite = () => {
    isActiveRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore.
    }

    setIsListening(false);
    setSessionMode("write");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // ============================================================
  // AI REQUEST
  // ============================================================

  const sendToAI = async (
    message,
    subject,
    topic
  ) => {
    const API_URL =
      "http://localhost:5000/api/tutor";

    try {
      setLoading(true);

      console.log(
        "================================================"
      );
      console.log(
        "🤖 SENDING MESSAGE TO AI TUTOR"
      );
      console.log(
        "================================================"
      );
      console.log("URL:", API_URL);
      console.log("Message:", message);
      console.log("Subject:", subject);
      console.log("Topic:", topic);
      console.log("Class:", classType);

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },

          body: JSON.stringify({
            message,
            subject,
            topic,
            classLevel: classType,
            language:
              localStorage.getItem(
                "ai_language"
              ) || "English",
          }),
        }
      );

      console.log(
        "📡 Tutor HTTP status:",
        response.status
      );

      // --------------------------------------------------------
      // READ RESPONSE SAFELY
      // --------------------------------------------------------

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data = null;
      let rawText = "";

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        rawText =
          await response.text();

        console.error(
          "❌ Backend returned non-JSON:",
          rawText
        );
      }

      console.log(
        "📦 Tutor response:",
        data || rawText
      );

      // --------------------------------------------------------
      // HTTP ERROR
      // --------------------------------------------------------

      if (!response.ok) {
        const backendError =
          data?.details ||
          data?.error ||
          rawText ||
          `HTTP ${response.status}`;

        console.error(
          "❌ AI Tutor backend error:",
          backendError
        );

        throw new Error(
          backendError
        );
      }

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      const reply =
        data?.reply?.trim();

      if (!reply) {
        throw new Error(
          "The AI Tutor returned an empty response."
        );
      }

      console.log(
        "✅ AI RESPONSE RECEIVED"
      );

      return reply;
    } catch (error) {
      console.error(
        "AI Tutor Error:",
        error
      );

      // Keep the error useful for the UI.
      const message =
        error?.message ||
        "Unknown AI Tutor error.";

      return `I couldn't connect to the AI Tutor right now.

Reason: ${message}

Please make sure the tutor backend is running at http://localhost:5000.`;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // AI SPEECH
  // ============================================================

  const speakAI = (text) => {
    if (!soundEnabled) {
      return;
    }

    if (
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    let spokenText = text
      .replace(
        /\\frac\{([^}]+)\}\{([^}]+)\}/g,
        "$1 divided by $2"
      )
      .replace(
        /\\sqrt\{([^}]+)\}/g,
        "the square root of $1"
      )
      .replace(
        /\^\{?([^}]+)\}?/g,
        " to the power of $1"
      )
      .replace(
        /\\text\{([^}]+)\}/g,
        "$1"
      )
      .replace(
        /\*\*/g,
        ""
      )
      .replace(
        /###?/g,
        ""
      )
      .replace(
        /=/g,
        " equals "
      )
      .replace(
        /\+/g,
        " plus "
      )
      .replace(
        /-/g,
        " minus "
      )
      .replace(
        /\*/g,
        " times "
      )
      .replace(
        /\//g,
        " divided by "
      )
      .replace(
        /[\$\{\}\\]/g,
        ""
      );

    const utterance =
      new SpeechSynthesisUtterance(
        spokenText
      );

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsAISpeaking(true);
    };

    utterance.onend = () => {
      setIsAISpeaking(false);
    };

    utterance.onerror = () => {
      setIsAISpeaking(false);
    };

    window.speechSynthesis.speak(
      utterance
    );
  };

  // ============================================================
  // SEND / PROCESS MESSAGE
  // ============================================================

  const processMessage = async (
    userText
  ) => {
    if (
      !userText?.trim() ||
      loading
    ) {
      return;
    }

    const trimmedText =
      userText.trim();

    const detected =
      detectSubjectAndTopic(
        trimmedText
      );

    setCurrentSubject(
      detected.subject
    );

    setCurrentTopic(
      detected.topic
    );

    const userMessage = {
      id:
        `${Date.now()}-user`,
      role: "user",
      text: trimmedText,
      time: new Date(),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");

    const aiText =
      await sendToAI(
        trimmedText,
        detected.subject,
        detected.topic
      );

    const aiMessage = {
      id:
        `${Date.now()}-ai`,
      role: "ai",
      text: aiText,
      time: new Date(),
    };

    setMessages((prev) => [
      ...prev,
      aiMessage,
    ]);

    // Only update progress after a real AI response.
    if (
      aiText &&
      !aiText.startsWith(
        "I couldn't connect"
      )
    ) {
      await updateProgress(
        detected.subject,
        detected.topic
      );
    }

    speakAI(aiText);
  };

  const handleUserSpeak = async (
    text
  ) => {
    await processMessage(text);
  };

  const handleWriteMessage = async () => {
    if (
      !input.trim() ||
      loading
    ) {
      return;
    }

    await processMessage(input);
  };

  // ============================================================
  // QUICK PROMPTS
  // ============================================================

  const quickPrompts = useMemo(
    () => [
      {
        icon: Lightbulb,
        title:
          "Explain a concept",
        text:
          "Explain this topic to me in a simple way.",
      },
      {
        icon: BookOpen,
        title:
          "Give me practice",
        text:
          "Give me a WAEC-style practice question.",
      },
      {
        icon: GraduationCap,
        title:
          "Exam preparation",
        text:
          "Help me prepare for my upcoming examination.",
      },
      {
        icon: TrendingUp,
        title:
          "Improve my skills",
        text:
          "What should I study to improve in this subject?",
      },
    ],
    []
  );

  // ============================================================
  // CLEAR CHAT
  // ============================================================

  const clearChat = () => {
    window.speechSynthesis.cancel();

    isActiveRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore.
    }

    setMessages([]);
    setInput("");
    setIsAISpeaking(false);
    setIsListening(false);
    setSessionMode("idle");
  };

  // ============================================================
  // TIME
  // ============================================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(date);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#020617] text-white">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <AITutorHeader />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="flex flex-1 min-h-0 overflow-hidden">

        <AITutorSidebar
          setActivePanel={
            setActivePanel
          }
        />

        <main className="relative flex-1 min-w-0 overflow-hidden">

          {/* BACKGROUND */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize:
                  "24px 24px",
              }}
            />
          </div>

          <div className="relative h-full flex gap-5 p-4 md:p-5 lg:p-6">

            {/* =================================================
                LEFT AI DISPLAY
            ================================================= */}

            <aside className="hidden xl:block w-[31%] min-w-[320px] max-w-[430px]">
              <div className="h-full rounded-3xl border border-white/[0.08] bg-slate-950/60 backdrop-blur-xl shadow-2xl overflow-hidden">
                <AITutorDisplay
                  onStartSpeak={
                    startSpeak
                  }
                  onStartWrite={
                    startWrite
                  }
                  onStop={stopSpeak}
                  sessionMode={
                    sessionMode
                  }
                />
              </div>
            </aside>

            {/* =================================================
                CHAT
            ================================================= */}

            <section className="flex-1 min-w-0 flex flex-col rounded-3xl border border-white/[0.08] bg-slate-950/70 backdrop-blur-xl shadow-2xl overflow-hidden">

              {/* =================================================
                  CHAT HEADER
              ================================================= */}

              <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/[0.07]">

                <div className="flex items-center gap-3 min-w-0">

                  <div className="relative shrink-0">

                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Bot
                        size={23}
                        strokeWidth={2}
                      />
                    </div>

                    <span className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
                  </div>

                  <div className="min-w-0">

                    <div className="flex items-center gap-2">

                      <h1 className="font-bold text-lg truncate">
                        AI Tutor
                      </h1>

                      <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                        <Sparkles
                          size={10}
                        />
                        Premium
                      </span>

                    </div>

                    <p className="text-xs text-slate-400 truncate">
                      {currentSubject}
                      {" • "}
                      {currentTopic}
                      {" • "}
                      {classType}
                    </p>

                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">

                  {/* SUBJECT */}

                  <div className="relative hidden md:block">

                    <button
                      onClick={() =>
                        setShowSubjectMenu(
                          (prev) =>
                            !prev
                        )
                      }
                      className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                    >
                      <BookOpen
                        size={14}
                      />

                      {currentSubject}

                      <ChevronDown
                        size={13}
                      />
                    </button>

                    {showSubjectMenu && (
                      <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-white/[0.08] bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl">

                        {subjects.map(
                          (subject) => (
                            <button
                              key={
                                subject
                              }
                              onClick={() => {
                                setCurrentSubject(
                                  subject
                                );

                                setCurrentTopic(
                                  "Introduction"
                                );

                                setShowSubjectMenu(
                                  false
                                );
                              }}
                              className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                                currentSubject ===
                                subject
                                  ? "bg-blue-600/20 text-blue-300"
                                  : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                              }`}
                            >
                              {
                                subject
                              }
                            </button>
                          )
                        )}

                      </div>
                    )}

                  </div>

                  {/* SOUND */}

                  <button
                    onClick={() => {
                      if (
                        isAISpeaking
                      ) {
                        window.speechSynthesis.cancel();
                        setIsAISpeaking(
                          false
                        );
                      }

                      setSoundEnabled(
                        (prev) =>
                          !prev
                      );
                    }}
                    title={
                      soundEnabled
                        ? "Mute AI"
                        : "Enable AI voice"
                    }
                    className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    {soundEnabled ? (
                      <Volume2
                        size={16}
                      />
                    ) : (
                      <VolumeX
                        size={16}
                      />
                    )}
                  </button>

                  {/* CLEAR */}

                  <button
                    onClick={
                      clearChat
                    }
                    title="Clear conversation"
                    className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <RotateCcw
                      size={16}
                    />
                  </button>

                  {/* SETTINGS */}

                  <button
                    onClick={() =>
                      setActivePanel(
                        "settings"
                      )
                    }
                    className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    <Settings
                      size={16}
                    />
                  </button>

                </div>
              </div>

              {/* =================================================
                  PANELS
              ================================================= */}

              {activePanel !==
              "home" ? (
                <div className="flex-1 min-h-0 overflow-y-auto p-5 custom-scrollbar">

                  {activePanel ===
                    "subjects" && (
                    <SubjectsPanel />
                  )}

                  {activePanel ===
                    "progress" && (
                    <ProgressPanel />
                  )}

                  {activePanel ===
                    "settings" && (
                    <SettingsPanel />
                  )}

                </div>
              ) : (
                <>

                  {/* =================================================
                      MESSAGES
                  ================================================= */}

                  <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 md:px-6 custom-scrollbar">

                    {messages.length ===
                    0 ? (
                      <div className="h-full flex items-center justify-center">

                        <div className="w-full max-w-2xl text-center">

                          <div className="mx-auto mb-5 relative w-fit">

                            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-400/10 flex items-center justify-center">
                              <Sparkles
                                size={36}
                                className="text-blue-300"
                              />
                            </div>

                            <div className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                              <MessageCircle
                                size={14}
                                className="text-violet-300"
                              />
                            </div>

                          </div>

                          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                            What would you
                            like to learn?
                          </h2>

                          <p className="mt-2 text-sm md:text-base text-slate-400 max-w-lg mx-auto">
                            Ask your AI Tutor
                            anything about{" "}
                            <span className="text-blue-300 font-medium">
                              {
                                classType
                              }
                            </span>{" "}
                            subjects. Get
                            explanations,
                            examples, practice
                            questions and exam
                            preparation.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 text-left">

                            {quickPrompts.map(
                              (
                                prompt
                              ) => {
                                const Icon =
                                  prompt.icon;

                                return (
                                  <button
                                    key={
                                      prompt.title
                                    }
                                    onClick={() =>
                                      processMessage(
                                        prompt.text
                                      )
                                    }
                                    disabled={
                                      loading
                                    }
                                    className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-400/20 hover:bg-blue-500/[0.06] disabled:opacity-50"
                                  >
                                    <div className="flex items-start gap-3">

                                      <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-300 group-hover:bg-blue-500/20">
                                        <Icon
                                          size={
                                            17
                                          }
                                        />
                                      </div>

                                      <div>
                                        <p className="font-semibold text-sm">
                                          {
                                            prompt.title
                                          }
                                        </p>

                                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                          {
                                            prompt.text
                                          }
                                        </p>
                                      </div>

                                    </div>
                                  </button>
                                );
                              }
                            )}

                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mx-auto max-w-4xl space-y-5">

                        {messages.map(
                          (
                            message
                          ) => {
                            const isAI =
                              message.role ===
                              "ai";

                            return (
                              <div
                                key={
                                  message.id
                                }
                                className={`flex gap-3 ${
                                  isAI
                                    ? "justify-start"
                                    : "justify-end"
                                }`}
                              >

                                {isAI && (
                                  <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
                                    <Bot
                                      size={
                                        17
                                      }
                                    />
                                  </div>
                                )}

                                <div
                                  className={`max-w-[82%] ${
                                    isAI
                                      ? ""
                                      : "items-end"
                                  }`}
                                >

                                  <div
                                    className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
                                      isAI
                                        ? "rounded-tl-md border border-blue-400/10 bg-blue-500/[0.07] text-slate-200"
                                        : "rounded-tr-md bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/10"
                                    }`}
                                  >
                                    <MathText
                                      text={
                                        message.text
                                      }
                                    />
                                  </div>

                                  <div
                                    className={`mt-1.5 flex items-center gap-2 text-[10px] text-slate-600 ${
                                      isAI
                                        ? ""
                                        : "justify-end"
                                    }`}
                                  >

                                    {isAI ? (
                                      <>
                                        <span>
                                          AI Tutor
                                        </span>

                                        <span>
                                          •
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <User
                                          size={
                                            10
                                          }
                                        />

                                        <span>
                                          You
                                        </span>

                                        <span>
                                          •
                                        </span>
                                      </>
                                    )}

                                    <span>
                                      {formatTime(
                                        message.time
                                      )}
                                    </span>

                                  </div>
                                </div>

                                {!isAI && (
                                  <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-800 border border-white/[0.06] flex items-center justify-center">
                                    <User
                                      size={
                                        16
                                      }
                                      className="text-slate-400"
                                    />
                                  </div>
                                )}

                              </div>
                            );
                          }
                        )}

                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {loading && (
                          <div className="flex gap-3">

                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                              <Bot
                                size={17}
                              />
                            </div>

                            <div className="rounded-2xl rounded-tl-md border border-white/[0.07] bg-white/[0.025] px-4 py-3">

                              <div className="flex items-center gap-2 text-xs text-slate-400">

                                <Loader2
                                  size={14}
                                  className="animate-spin text-blue-400"
                                />

                                <span>
                                  AI Tutor is
                                  thinking...
                                </span>

                              </div>

                            </div>
                          </div>
                        )}

                        <div
                          ref={
                            messagesEndRef
                          }
                        />

                      </div>
                    )}

                  </div>

                  {/* =================================================
                      SPEAKING STATUS
                  ================================================= */}

                  {sessionMode ===
                    "speak" && (
                    <div className="px-5 pb-2">

                      <div className="rounded-2xl border border-blue-400/10 bg-blue-500/[0.05] px-4 py-3 flex items-center justify-between">

                        <div className="flex items-center gap-3">

                          <div className="relative h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">

                            {isListening ? (
                              <>
                                <span className="absolute inset-0 rounded-xl bg-blue-500/20 animate-ping" />

                                <Mic
                                  size={
                                    16
                                  }
                                  className="relative text-blue-300"
                                />
                              </>
                            ) : (
                              <MicOff
                                size={
                                  16
                                }
                                className="text-slate-500"
                              />
                            )}

                          </div>

                          <div>

                            <p className="text-xs font-semibold text-slate-200">
                              {isListening
                                ? "Listening..."
                                : "Voice mode"}
                            </p>

                            <p className="text-[11px] text-slate-500">
                              Speak naturally and
                              your tutor will
                              respond.
                            </p>

                          </div>

                        </div>

                        <button
                          onClick={
                            stopSpeak
                          }
                          className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-400/10 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20"
                        >
                          <Square
                            size={12}
                            fill="currentColor"
                          />
                          Stop
                        </button>

                      </div>
                    </div>
                  )}

                  {/* =================================================
                      INPUT
                  ================================================= */}

                  <div className="p-4 md:p-5">

                    <div className="mx-auto max-w-4xl">

                      <div className="relative rounded-2xl border border-white/[0.09] bg-white/[0.035] shadow-xl transition focus-within:border-blue-400/30 focus-within:bg-white/[0.05]">

                        <textarea
                          ref={
                            inputRef
                          }
                          value={input}
                          onChange={(
                            e
                          ) =>
                            setInput(
                              e.target
                                .value
                            )
                          }
                          onKeyDown={(
                            e
                          ) => {
                            if (
                              e.key ===
                                "Enter" &&
                              !e.shiftKey
                            ) {
                              e.preventDefault();

                              handleWriteMessage();
                            }
                          }}
                          onFocus={() =>
                            setSessionMode(
                              "write"
                            )
                          }
                          rows={1}
                          disabled={
                            loading
                          }
                          placeholder={
                            sessionMode ===
                            "speak"
                              ? "Use voice mode or switch to typing..."
                              : "Ask your AI Tutor anything..."
                          }
                          className="w-full resize-none bg-transparent px-4 py-4 pr-28 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-50"
                        />

                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">

                          {/* MIC */}

                          <button
                            onClick={
                              isListening
                                ? stopSpeak
                                : startSpeak
                            }
                            disabled={
                              loading
                            }
                            title={
                              isListening
                                ? "Stop listening"
                                : "Voice input"
                            }
                            className={`h-9 w-9 rounded-xl flex items-center justify-center transition ${
                              isListening
                                ? "bg-red-500/15 text-red-300 border border-red-400/10"
                                : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
                            } disabled:opacity-40`}
                          >
                            {isListening ? (
                              <MicOff
                                size={
                                  17
                                }
                              />
                            ) : (
                              <Mic
                                size={
                                  17
                                }
                              />
                            )}
                          </button>

                          {/* SEND */}

                          <button
                            onClick={
                              handleWriteMessage
                            }
                            disabled={
                              !input.trim() ||
                              loading
                            }
                            className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-400 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {loading ? (
                              <Loader2
                                size={
                                  17
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <Send
                                size={
                                  17
                                }
                              />
                            )}
                          </button>

                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between px-1">

                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <Sparkles
                            size={11}
                            className="text-blue-500"
                          />
                          AI Tutor can
                          explain, quiz
                          and coach you.
                        </div>

                        <div className="hidden sm:block text-[10px] text-slate-600">
                          Enter to send •
                          Shift + Enter for
                          new line
                        </div>

                      </div>
                    </div>
                  </div>

                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* ============================================================
          SCROLLBAR
      ============================================================ */}

      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.35) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.35);
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.55);
        }
      `}</style>
    </div>
  );
};

export default AITutorSession;