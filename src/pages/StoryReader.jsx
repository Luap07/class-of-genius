import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate, useParams } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import {
  Menu,
  X,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Clock3,
  PanelsTopLeft,
  Settings2,
  Type,
  Sparkles,
  Star,
  Search,
  Home,
  List,
  RotateCcw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Sun,
  Moon,
  Leaf,
  Coffee,
  Check,
  SlidersHorizontal,
  ArrowLeft,
  LocateFixed,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import ReaderReviews from "../components/ReaderReviews";
import Cog from "../assets/cog.png";

/* ============================================================
   HELPERS
============================================================ */

const clamp = (value, min, max) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(Math.max(number, min), max);
};

const safeParse = (value, fallback) => {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const getReadingWidthClass = (width) => {
  switch (width) {
    case "3xl":
      return "max-w-3xl";

    case "4xl":
      return "max-w-4xl";

    case "5xl":
      return "max-w-5xl";

    case "6xl":
      return "max-w-6xl";

    default:
      return "max-w-4xl";
  }
};

/*
  Always return an array.

  This is important because the previous error was:

  Cannot read properties of null (reading 'find')

  If localStorage ever contains null, malformed data,
  or an old bookmark structure, this prevents .find()
  and .some() from crashing the component.
*/
const normalizeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

/* ============================================================
   MAIN
============================================================ */

export default function StoryReader() {
  const { id } = useParams();
  const navigate = useNavigate();

  const readerRef = useRef(null);
  const contentRef = useRef(null);
  const speechRef = useRef(null);
  const searchInputRef = useRef(null);

  /* ==========================================================
     BOOK
  ========================================================== */

  const [loading, setLoading] = useState(true);
  const [novel, setNovel] = useState(null);
  const [loadError, setLoadError] = useState(null);

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const [stepIndex, setStepIndex] = useState(0);
  const [coverPage, setCoverPage] = useState(true);

  /* ==========================================================
     SIDEBAR
  ========================================================== */

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  /* ==========================================================
     SETTINGS
  ========================================================== */

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [fontSize, setFontSize] = useState(() =>
    clamp(
      Number(
        localStorage.getItem("reader-font-size") || 18
      ),
      14,
      32
    )
  );

  const [lineHeight, setLineHeight] = useState(() =>
    clamp(
      Number(
        localStorage.getItem("reader-line-height") || 2
      ),
      1.4,
      2.6
    )
  );

  const [readingWidth, setReadingWidth] = useState(
    () =>
      localStorage.getItem("reader-width") ||
      "4xl"
  );

  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("reader-theme") ||
      "dark"
  );

  /* ==========================================================
     SPEECH
  ========================================================== */

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [voices, setVoices] = useState([]);

  const [selectedVoice, setSelectedVoice] =
    useState(
      () =>
        localStorage.getItem("reader-voice") ||
        ""
    );

  const [voiceRate, setVoiceRate] = useState(() =>
    clamp(
      Number(
        localStorage.getItem(
          "reader-voice-rate"
        ) || 1
      ),
      0.5,
      2
    )
  );

  const [voicePitch, setVoicePitch] =
    useState(() =>
      clamp(
        Number(
          localStorage.getItem(
            "reader-voice-pitch"
          ) || 1
        ),
        0.5,
        2
      )
    );

  /* ==========================================================
     PROGRESS
  ========================================================== */

  const [progress, setProgress] = useState(0);
  const [lastRead, setLastRead] = useState(null);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [search, setSearch] = useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  /* ==========================================================
     BOOKMARKS
  ========================================================== */

  const [bookmarks, setBookmarks] = useState(
    () => {
      const saved = safeParse(
        localStorage.getItem(
          `reader-bookmarks-${id}`
        ),
        []
      );

      return normalizeArray(saved);
    }
  );

  const [bookmarksOpen, setBookmarksOpen] =
    useState(false);

  /* ==========================================================
     REVIEWS
  ========================================================== */

  const [showReviews, setShowReviews] =
    useState(false);

  /* ==========================================================
     FULLSCREEN
  ========================================================== */

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  /* ==========================================================
     LOAD NOVEL
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const fetchNovel = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const { data, error } =
          await supabase
            .from("novels")
            .select("*")
            .eq("id", id)
            .single();

        if (!mounted) return;

        if (error) {
          console.error(
            "StoryReader:",
            error
          );

          setLoadError(error);
          setNovel(null);
          setLoading(false);

          return;
        }

        if (!data) {
          setLoadError(
            new Error(
              "Novel was not found."
            )
          );

          setNovel(null);
          setLoading(false);

          return;
        }

        setNovel(data);

        const saved = safeParse(
          localStorage.getItem(
            `reader-progress-${id}`
          ),
          null
        );

        if (
          saved &&
          typeof saved === "object"
        ) {
          setLastRead(saved);

          if (
            typeof saved.stepIndex ===
            "number"
          ) {
            setStepIndex(
              Math.max(
                0,
                saved.stepIndex
              )
            );

            setCoverPage(
              saved.stepIndex === 0
            );
          }
        } else {
          setLastRead(null);
          setStepIndex(0);
          setCoverPage(true);
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "StoryReader unexpected error:",
          error
        );

        if (!mounted) return;

        setLoadError(error);
        setNovel(null);
        setLoading(false);
      }
    };

    fetchNovel();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* ==========================================================
     RELOAD BOOKMARKS WHEN ID CHANGES
  ========================================================== */

  useEffect(() => {
    const saved = safeParse(
      localStorage.getItem(
        `reader-bookmarks-${id}`
      ),
      []
    );

    setBookmarks(
      normalizeArray(saved)
    );
  }, [id]);

  /* ==========================================================
     CHAPTERS
  ========================================================== */

  const chapters = useMemo(() => {
    return normalizeArray(
      novel?.chapters
    );
  }, [novel]);

  /* ==========================================================
     READER FLOW
  ========================================================== */

  const flow = useMemo(() => {
    if (!novel) return [];

    return [
      {
        type: "cover",
        title:
          novel.title ||
          "Untitled Book",
        description:
          novel.description || "",
        image:
          novel.cover_url || "",
      },

      {
        type: "intro",
        title: "Introduction",
        content:
          novel.introduction ||
          "No introduction available.",
      },

      ...chapters.map(
        (chapter, index) => ({
          type: "chapter",
          number: index + 1,
          title:
            chapter?.title ||
            `Chapter ${index + 1}`,
          content:
            chapter?.content || "",
        })
      ),
    ];
  }, [novel, chapters]);

  /* ==========================================================
     SAFE CURRENT SECTION
  ========================================================== */

  const current =
    flow[
      clamp(
        stepIndex,
        0,
        Math.max(flow.length - 1, 0)
      )
    ] ||
    flow[0] ||
    {
      type: "cover",
      title: "",
      description: "",
      content: "",
    };

  /* ==========================================================
     THEME
  ========================================================== */

  const themeStyles = useMemo(() => {
    switch (theme) {
      case "light":
        return {
          page:
            "bg-[#f8fafc] text-slate-900",

          card:
            "bg-white border border-slate-200 shadow-xl",

          sidebar:
            "bg-white/95 backdrop-blur-xl border-r border-slate-200 text-slate-900",

          nav:
            "bg-white/90 backdrop-blur-xl border-b border-slate-200",

          input:
            "bg-slate-100 text-slate-900 border-slate-200",

          secondary:
            "text-slate-500",

          muted:
            "text-slate-400",

          progress:
            "bg-slate-200",

          button:
            "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",

          accent:
            "bg-cyan-600 text-white hover:bg-cyan-500",

          icon:
            "text-slate-600",
        };

      case "sepia":
        return {
          page:
            "bg-[#f7f1e3] text-[#2d2418]",

          card:
            "bg-[#fffaf0] border border-[#e5d7b8] shadow-xl",

          sidebar:
            "bg-[#fff8ec]/95 backdrop-blur-xl border-r border-[#e5d7b8] text-[#2d2418]",

          nav:
            "bg-[#fff8ec]/95 backdrop-blur-xl border-b border-[#e5d7b8]",

          input:
            "bg-[#f1e6ce] text-[#2d2418] border-[#e5d7b8]",

          secondary:
            "text-[#78654c]",

          muted:
            "text-[#a18c6d]",

          progress:
            "bg-[#e5d7b8]",

          button:
            "border-[#dfcfad] bg-[#fff8ec] text-[#5c4931] hover:bg-[#f4ead5]",

          accent:
            "bg-[#9a6b35] text-white hover:bg-[#80562b]",

          icon:
            "text-[#6b573c]",
        };

      case "forest":
        return {
          page:
            "bg-[#0c1814] text-emerald-50",

          card:
            "bg-[#14231d] border border-emerald-900/50 shadow-xl",

          sidebar:
            "bg-[#101d18]/95 backdrop-blur-xl border-r border-emerald-900/50 text-emerald-50",

          nav:
            "bg-[#101d18]/95 backdrop-blur-xl border-b border-emerald-900/50",

          input:
            "bg-[#1c3027] text-emerald-50 border-emerald-900/50",

          secondary:
            "text-emerald-200/70",

          muted:
            "text-emerald-300/40",

          progress:
            "bg-[#1d342a]",

          button:
            "border-emerald-900/60 bg-[#162820] text-emerald-100 hover:bg-emerald-900/30",

          accent:
            "bg-emerald-600 text-white hover:bg-emerald-500",

          icon:
            "text-emerald-200",
        };

      default:
        return {
          page:
            "bg-[#080d17] text-slate-100",

          card:
            "bg-[#111a2b] border border-slate-700/60 shadow-2xl",

          sidebar:
            "bg-[#0b1321]/95 backdrop-blur-xl border-r border-slate-700/60 text-white",

          nav:
            "bg-[#0b1321]/90 backdrop-blur-xl border-b border-slate-700/60",

          input:
            "bg-slate-800/80 text-white border-slate-700",

          secondary:
            "text-slate-400",

          muted:
            "text-slate-500",

          progress:
            "bg-slate-800",

          button:
            "border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800",

          accent:
            "bg-cyan-600 text-white hover:bg-cyan-500",

          icon:
            "text-slate-300",
        };
    }
  }, [theme]);

  /* ==========================================================
     SAVE SETTINGS
  ========================================================== */

  useEffect(() => {
    localStorage.setItem(
      "reader-font-size",
      String(fontSize)
    );
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(
      "reader-line-height",
      String(lineHeight)
    );
  }, [lineHeight]);

  useEffect(() => {
    localStorage.setItem(
      "reader-width",
      readingWidth
    );
  }, [readingWidth]);

  useEffect(() => {
    localStorage.setItem(
      "reader-theme",
      theme
    );
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      "reader-voice",
      selectedVoice
    );
  }, [selectedVoice]);

  useEffect(() => {
    localStorage.setItem(
      "reader-voice-rate",
      String(voiceRate)
    );
  }, [voiceRate]);

  useEffect(() => {
    localStorage.setItem(
      "reader-voice-pitch",
      String(voicePitch)
    );
  }, [voicePitch]);

  /* ==========================================================
     LOAD SPEECH VOICES
  ========================================================== */

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const loadVoices = () => {
      const available =
        window.speechSynthesis.getVoices();

      const safeVoices =
        Array.isArray(available)
          ? available
          : [];

      setVoices(safeVoices);

      if (
        safeVoices.length > 0 &&
        !selectedVoice
      ) {
        const preferred =
          safeVoices.find((voice) =>
            /en[-_](NG|GB|US)/i.test(
              voice.lang || ""
            )
          ) ||
          safeVoices.find((voice) =>
            /^en/i.test(
              voice.lang || ""
            )
          ) ||
          safeVoices[0];

        if (preferred?.name) {
          setSelectedVoice(
            preferred.name
          );
        }
      }
    };

    loadVoices();

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      loadVoices
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        loadVoices
      );
    };
  }, [selectedVoice]);

  /* ==========================================================
     STOP SPEECH
  ========================================================== */

  const stopSpeech = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    speechRef.current = null;
    setIsSpeaking(false);
  }, []);

  /* ==========================================================
     SPEAK
  ========================================================== */

  const speak = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    if (isSpeaking) {
      stopSpeech();
      return;
    }

    const text =
      current.content ||
      current.description ||
      current.title ||
      "";

    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    const safeVoices =
      Array.isArray(voices)
        ? voices
        : [];

    const voice = safeVoices.find(
      (item) =>
        item?.name === selectedVoice
    );

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = clamp(
      voiceRate,
      0.5,
      2
    );

    utterance.pitch = clamp(
      voicePitch,
      0.5,
      2
    );

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      speechRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      speechRef.current = null;
    };

    speechRef.current = utterance;

    window.speechSynthesis.speak(
      utterance
    );

    setIsSpeaking(true);
  }, [
    current,
    isSpeaking,
    selectedVoice,
    stopSpeech,
    voicePitch,
    voiceRate,
    voices,
  ]);

  /* ==========================================================
     STOP SPEECH ON PAGE CHANGE
  ========================================================== */

  useEffect(() => {
    stopSpeech();
  }, [stepIndex, stopSpeech]);

  /* ==========================================================
     PROGRESS
  ========================================================== */

  useEffect(() => {
    if (!flow.length) {
      setProgress(0);
      return;
    }

    const calculated =
      ((stepIndex + 1) /
        flow.length) *
      100;

    setProgress(
      clamp(calculated, 0, 100)
    );
  }, [stepIndex, flow.length]);

  /* ==========================================================
     SAVE READING POSITION
  ========================================================== */

  useEffect(() => {
    if (!flow.length || !novel) {
      return;
    }

    const timeout = setTimeout(() => {
      const saved = {
        stepIndex,
        scroll:
          contentRef.current?.scrollTop ||
          0,
        updatedAt: Date.now(),
      };

      localStorage.setItem(
        `reader-progress-${id}`,
        JSON.stringify(saved)
      );

      setLastRead(saved);
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    stepIndex,
    id,
    flow.length,
    novel,
  ]);

  /* ==========================================================
     SAVE SCROLL POSITION
  ========================================================== */

  useEffect(() => {
    const element =
      contentRef.current;

    if (!element) return;

    let timeout;

    const handleScroll = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        const saved = safeParse(
          localStorage.getItem(
            `reader-progress-${id}`
          ),
          {}
        );

        const safeSaved =
          saved &&
          typeof saved === "object"
            ? saved
            : {};

        const updated = {
          ...safeSaved,
          stepIndex,
          scroll:
            element.scrollTop || 0,
          updatedAt: Date.now(),
        };

        localStorage.setItem(
          `reader-progress-${id}`,
          JSON.stringify(updated)
        );

        setLastRead(updated);
      }, 300);
    };

    element.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      clearTimeout(timeout);

      element.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [id, stepIndex]);

  /* ==========================================================
     RESTORE SCROLL
  ========================================================== */

  useEffect(() => {
    if (
      !lastRead ||
      !contentRef.current
    ) {
      return;
    }

    if (
      lastRead.stepIndex !==
      stepIndex
    ) {
      return;
    }

    requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop =
          Number(lastRead.scroll) || 0;
      }
    });
  }, [stepIndex, lastRead]);

  /* ==========================================================
     SCROLL TOP
  ========================================================== */

  const scrollTop = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);

  /* ==========================================================
     GO TO STEP
  ========================================================== */

  const goToStep = useCallback(
    (index) => {
      if (!flow.length) {
        return;
      }

      const safeIndex = clamp(
        index,
        0,
        Math.max(flow.length - 1, 0)
      );

      setStepIndex(safeIndex);
      setCoverPage(
        safeIndex === 0
      );
      setSidebarOpen(false);

      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      });
    },
    [flow.length]
  );

  /* ==========================================================
     NEXT
  ========================================================== */

  const nextPage = useCallback(() => {
    if (!flow.length) return;

    if (
      stepIndex <
      flow.length - 1
    ) {
      goToStep(stepIndex + 1);
    } else {
      goToStep(0);
    }
  }, [
    flow.length,
    goToStep,
    stepIndex,
  ]);

  /* ==========================================================
     PREVIOUS
  ========================================================== */

  const previousPage =
    useCallback(() => {
      if (
        stepIndex > 0 &&
        flow.length
      ) {
        goToStep(stepIndex - 1);
      }
    }, [
      flow.length,
      goToStep,
      stepIndex,
    ]);

  /* ==========================================================
     CONTINUE READING
  ========================================================== */

  const continueReading = useCallback(() => {
    const savedStep =
      lastRead?.stepIndex;

    if (
      typeof savedStep === "number" &&
      savedStep >= 0 &&
      savedStep < flow.length
    ) {
      setStepIndex(savedStep);
      setCoverPage(
        savedStep === 0
      );

      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop =
            Number(
              lastRead?.scroll
            ) || 0;
        }
      });
    } else if (flow.length > 1) {
      goToStep(1);
    }
  }, [
    flow.length,
    goToStep,
    lastRead,
  ]);

  /* ==========================================================
     RESTART
  ========================================================== */

  const restartBook = useCallback(() => {
    localStorage.removeItem(
      `reader-progress-${id}`
    );

    const reset = {
      stepIndex:
        flow.length > 1 ? 1 : 0,
      scroll: 0,
      updatedAt: Date.now(),
    };

    setLastRead(reset);

    setStepIndex(
      reset.stepIndex
    );

    setCoverPage(
      reset.stepIndex === 0
    );

    requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    });
  }, [id, flow.length]);

  /* ==========================================================
     BOOKMARK
  ========================================================== */

  /*
    IMPORTANT FIX:

    bookmarks is ALWAYS normalized before .find(),
    .some(), .filter(), .map(), etc.

    So even if localStorage contains:
      null
      {}
      invalid JSON
      an old value

    the reader will use [] instead.
  */

  const safeBookmarks =
    normalizeArray(bookmarks);

  const currentBookmark =
    safeBookmarks.find(
      (bookmark) =>
        bookmark &&
        bookmark.stepIndex ===
          stepIndex
    ) || null;

  const toggleBookmark = useCallback(() => {
    setBookmarks((previous) => {
      const currentBookmarks =
        normalizeArray(previous);

      const exists =
        currentBookmarks.some(
          (bookmark) =>
            bookmark &&
            bookmark.stepIndex ===
              stepIndex
        );

      let updated;

      if (exists) {
        updated =
          currentBookmarks.filter(
            (bookmark) =>
              bookmark &&
              bookmark.stepIndex !==
                stepIndex
          );
      } else {
        updated = [
          ...currentBookmarks,
          {
            stepIndex,
            title:
              current?.title ||
              `Page ${stepIndex + 1}`,
            type:
              current?.type ||
              "page",
            number:
              current?.number || null,
            createdAt: Date.now(),
          },
        ];
      }

      localStorage.setItem(
        `reader-bookmarks-${id}`,
        JSON.stringify(updated)
      );

      return updated;
    });
  }, [
    current,
    id,
    stepIndex,
  ]);

  /* ==========================================================
     FULLSCREEN
  ========================================================== */

  const toggleFullscreen =
    useCallback(async () => {
      try {
        if (
          !document.fullscreenElement
        ) {
          await readerRef.current?.requestFullscreen?.();
        } else {
          await document.exitFullscreen?.();
        }
      } catch (error) {
        console.error(
          "Fullscreen error:",
          error
        );
      }
    }, []);

  useEffect(() => {
    const handleFullscreen = () => {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement
        )
      );
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );
    };
  }, []);

  /* ==========================================================
     SEARCH
  ========================================================== */

  useEffect(() => {
    const term =
      search.trim().toLowerCase();

    if (!term) {
      setSearchResults([]);
      return;
    }

    const safeFlow =
      Array.isArray(flow)
        ? flow
        : [];

    const results = safeFlow
      .map((item, index) => {
        if (!item) {
          return null;
        }

        const searchable = [
          item.title,
          item.description,
          item.content,
        ]
          .filter(
            (value) =>
              typeof value ===
                "string" &&
              value.trim()
          )
          .join(" ")
          .toLowerCase();

        if (
          !searchable.includes(term)
        ) {
          return null;
        }

        return {
          ...item,
          index,
        };
      })
      .filter(Boolean);

    setSearchResults(results);
  }, [flow, search]);

  const handleSearchSubmit = (
    event
  ) => {
    event.preventDefault();

    const results =
      Array.isArray(searchResults)
        ? searchResults
        : [];

    if (results.length > 0) {
      goToStep(
        results[0].index
      );

      setSearchOpen(false);
    }
  };

  /* ==========================================================
     KEYBOARD CONTROLS
  ========================================================== */

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tag =
        event.target?.tagName;

      const isTyping =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT";

      if (isTyping) return;

      if (
        event.key ===
        "ArrowRight"
      ) {
        event.preventDefault();
        nextPage();
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        event.preventDefault();
        previousPage();
      }

      if (
        event.key === " "
      ) {
        event.preventDefault();

        if (
          current?.content ||
          current?.description
        ) {
          speak();
        }
      }

      if (
        event.key.toLowerCase() ===
        "b"
      ) {
        event.preventDefault();
        toggleBookmark();
      }

      if (
        event.key.toLowerCase() ===
        "f"
      ) {
        event.preventDefault();
        toggleFullscreen();
      }

      if (
        event.key.toLowerCase() ===
        "s"
      ) {
        event.preventDefault();

        setSettingsOpen(
          (value) => !value
        );
      }

      if (
        event.key === "Escape"
      ) {
        setSettingsOpen(false);
        setSearchOpen(false);
        setBookmarksOpen(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    current?.content,
    current?.description,
    nextPage,
    previousPage,
    speak,
    toggleBookmark,
    toggleFullscreen,
  ]);

  /* ==========================================================
     CLEANUP
  ========================================================== */

  useEffect(() => {
    return () => {
      if (
        typeof window !==
          "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050912] text-white">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen
                size={22}
                className="text-cyan-400"
              />
            </div>
          </div>

          <p className="mt-5 text-sm font-bold text-slate-400">
            Preparing your reading experience...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (loadError || !novel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050912] px-6 text-white">
        <div className="w-full max-w-lg rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-xl">
          <BookOpen
            size={50}
            className="mx-auto text-cyan-400"
          />

          <h1 className="mt-5 text-2xl font-black">
            Book unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            We couldn't load this novel.
            Please try again or return to
            the previous page.
          </p>

          {loadError?.message && (
            <p className="mt-4 rounded-xl bg-black/30 p-3 text-xs text-red-300">
              {loadError.message}
            </p>
          )}

          <button
            onClick={() =>
              navigate(-1)
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white hover:bg-cyan-500"
          >
            <ArrowLeft size={17} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      ref={readerRef}
      className={`relative flex h-screen overflow-hidden transition-colors duration-500 ${themeStyles.page}`}
    >
      {/* ======================================================
          PREMIUM BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {theme === "dark" && (
          <>
            <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />

            <div className="absolute -right-40 top-1/3 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[170px]" />

            <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[160px]" />
          </>
        )}

        {theme === "forest" && (
          <>
            <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[160px]" />

            <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-green-500/10 blur-[160px]" />
          </>
        )}

        {theme === "sepia" && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#fff9ed,transparent_60%)]" />
        )}
      </div>

      {/* ======================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <motion.aside
        animate={{
          width:
            sidebarCollapsed
              ? 76
              : 300,
        }}
        transition={{
          duration: 0.25,
        }}
        className={`${themeStyles.sidebar} relative z-40 hidden h-full shrink-0 flex-col md:flex`}
      >
        {/* BRAND */}

        <div className="flex h-[74px] items-center justify-between border-b border-black/10 px-4 dark:border-white/10">
          {!sidebarCollapsed ? (
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={Cog}
                alt="Scholiqen"
                className="h-10 w-10 rounded-xl object-cover"
              />

              <div className="min-w-0">
                <h2 className="truncate font-black">
                  Scholiqen Reader
                </h2>

                <p
                  className={`text-[11px] ${themeStyles.secondary}`}
                >
                  Premium Reading
                </p>
              </div>
            </div>
          ) : (
            <img
              src={Cog}
              alt="Scholiqen"
              className="mx-auto h-10 w-10 rounded-xl object-cover"
            />
          )}

          {!sidebarCollapsed && (
            <button
              onClick={() =>
                setSidebarCollapsed(
                  true
                )
              }
              className={`rounded-xl p-2 ${themeStyles.button}`}
              title="Collapse sidebar"
            >
              <PanelsTopLeft
                size={18}
              />
            </button>
          )}
        </div>

        {/* COLLAPSED TOGGLE */}

        {sidebarCollapsed && (
          <button
            onClick={() =>
              setSidebarCollapsed(
                false
              )
            }
            className={`mx-auto mt-3 rounded-xl p-2 ${themeStyles.button}`}
            title="Expand sidebar"
          >
            <PanelsTopLeft
              size={18}
            />
          </button>
        )}

        {/* NAVIGATION */}

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarButton
            collapsed={
              sidebarCollapsed
            }
            icon={
              <BookOpen size={18} />
            }
            label="Book Cover"
            active={coverPage}
            themeStyles={
              themeStyles
            }
            onClick={() =>
              goToStep(0)
            }
          />

          <SidebarButton
            collapsed={
              sidebarCollapsed
            }
            icon={
              <Star size={18} />
            }
            label="Introduction"
            active={
              !coverPage &&
              stepIndex === 1
            }
            themeStyles={
              themeStyles
            }
            onClick={() =>
              goToStep(1)
            }
          />

          {!sidebarCollapsed && (
            <div
              className={`mb-3 mt-7 px-3 text-[10px] font-black uppercase tracking-[0.2em] ${themeStyles.secondary}`}
            >
              Chapters
            </div>
          )}

          {chapters.map(
            (chapter, index) => (
              <SidebarButton
                key={
                  chapter?.id ||
                  `chapter-${index}`
                }
                collapsed={
                  sidebarCollapsed
                }
                icon={
                  <List size={17} />
                }
                label={
                  chapter?.title ||
                  `Chapter ${
                    index + 1
                  }`
                }
                subtitle={`Chapter ${
                  index + 1
                }`}
                active={
                  !coverPage &&
                  stepIndex ===
                    index + 2
                }
                themeStyles={
                  themeStyles
                }
                onClick={() =>
                  goToStep(
                    index + 2
                  )
                }
              />
            )
          )}

          {/* BOOKMARKS */}

          <div className="mt-6 border-t border-black/10 pt-4 dark:border-white/10">
            <SidebarButton
              collapsed={
                sidebarCollapsed
              }
              icon={
                <Bookmark
                  size={18}
                />
              }
              label={`Bookmarks${
                safeBookmarks.length
                  ? ` (${safeBookmarks.length})`
                  : ""
              }`}
              active={
                bookmarksOpen
              }
              themeStyles={
                themeStyles
              }
              onClick={() =>
                setBookmarksOpen(
                  (value) => !value
                )
              }
            />

            <AnimatePresence>
              {bookmarksOpen &&
                !sidebarCollapsed && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 px-1 pt-2">
                      {safeBookmarks.length ===
                      0 ? (
                        <p
                          className={`rounded-xl p-3 text-xs ${themeStyles.secondary}`}
                        >
                          No bookmarks yet.
                        </p>
                      ) : (
                        safeBookmarks.map(
                          (
                            bookmark,
                            bookmarkIndex
                          ) => (
                            <button
                              key={
                                `${bookmark?.stepIndex ?? bookmarkIndex}-${bookmarkIndex}`
                              }
                              onClick={() =>
                                goToStep(
                                  Number(
                                    bookmark?.stepIndex
                                  ) || 0
                                )
                              }
                              className={`w-full rounded-xl p-3 text-left text-xs transition hover:bg-cyan-500/10 ${
                                bookmark?.stepIndex ===
                                stepIndex
                                  ? "bg-cyan-500/10"
                                  : ""
                              }`}
                            >
                              <p className="truncate font-bold">
                                {bookmark?.title ||
                                  `Page ${
                                    (bookmark?.stepIndex ??
                                      0) + 1
                                  }`}
                              </p>

                              <p
                                className={`mt-1 ${themeStyles.secondary}`}
                              >
                                {bookmark?.type ===
                                "chapter"
                                  ? `Chapter ${
                                      bookmark?.number ||
                                      ""
                                    }`
                                  : "Saved location"}
                              </p>
                            </button>
                          )
                        )
                      )}
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>

        {/* PROGRESS */}

        <div className="border-t border-black/10 p-4 dark:border-white/10">
          {!sidebarCollapsed ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold">
                  Reading progress
                </span>

                <span className="text-xs font-black text-cyan-500">
                  {Math.round(
                    progress
                  )}
                  %
                </span>
              </div>

              <div
                className={`h-2 overflow-hidden rounded-full ${themeStyles.progress}`}
              >
                <motion.div
                  className="h-full rounded-full bg-cyan-500"
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                />
              </div>
            </>
          ) : (
            <div
              className={`mx-auto h-8 w-2 overflow-hidden rounded-full ${themeStyles.progress}`}
            >
              <motion.div
                className="w-full rounded-full bg-cyan-500"
                animate={{
                  height: `${progress}%`,
                }}
              />
            </div>
          )}
        </div>
      </motion.aside>

      {/* ======================================================
          MOBILE SIDEBAR
      ====================================================== */}

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setSidebarOpen(
                  false
                )
              }
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm md:hidden"
            />

            <motion.aside
              initial={{
                x: -340,
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: -340,
              }}
              transition={{
                duration: 0.25,
              }}
              className={`fixed left-0 top-0 z-[90] flex h-full w-[310px] flex-col ${themeStyles.sidebar} md:hidden`}
            >
              <div className="flex items-center justify-between border-b border-black/10 p-5 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={Cog}
                    alt="Scholiqen"
                    className="h-10 w-10 rounded-xl"
                  />

                  <div>
                    <h2 className="font-black">
                      Scholiqen
                    </h2>

                    <p
                      className={`text-xs ${themeStyles.secondary}`}
                    >
                      Reader
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSidebarOpen(
                      false
                    )
                  }
                  className="rounded-xl p-2 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <MobileNavButton
                  icon={
                    <BookOpen size={18} />
                  }
                  label="Book Cover"
                  active={
                    coverPage
                  }
                  onClick={() =>
                    goToStep(0)
                  }
                />

                <MobileNavButton
                  icon={
                    <Star size={18} />
                  }
                  label="Introduction"
                  active={
                    !coverPage &&
                    stepIndex === 1
                  }
                  onClick={() =>
                    goToStep(1)
                  }
                />

                <p
                  className={`mb-3 mt-7 px-3 text-[10px] font-black uppercase tracking-[0.2em] ${themeStyles.secondary}`}
                >
                  Chapters
                </p>

                {chapters.map(
                  (
                    chapter,
                    index
                  ) => (
                    <MobileNavButton
                      key={
                        chapter?.id ||
                        `mobile-chapter-${index}`
                      }
                      icon={
                        <List
                          size={17}
                        />
                      }
                      label={
                        chapter?.title ||
                        `Chapter ${
                          index + 1
                        }`
                      }
                      active={
                        stepIndex ===
                        index + 2
                      }
                      onClick={() =>
                        goToStep(
                          index + 2
                        )
                      }
                    />
                  )
                )}

                {safeBookmarks.length >
                  0 && (
                  <div className="mt-6 border-t border-black/10 pt-5 dark:border-white/10">
                    <p
                      className={`mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] ${themeStyles.secondary}`}
                    >
                      Bookmarks
                    </p>

                    {safeBookmarks.map(
                      (
                        bookmark,
                        bookmarkIndex
                      ) => (
                        <MobileNavButton
                          key={`${bookmark?.stepIndex ?? bookmarkIndex}-mobile-bookmark`}
                          icon={
                            <Bookmark
                              size={17}
                            />
                          }
                          label={
                            bookmark?.title ||
                            `Page ${
                              (bookmark?.stepIndex ??
                                0) + 1
                            }`
                          }
                          active={
                            bookmark?.stepIndex ===
                            stepIndex
                          }
                          onClick={() =>
                            goToStep(
                              Number(
                                bookmark?.stepIndex
                              ) || 0
                            )
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-black/10 p-5 dark:border-white/10">
                <div className="mb-2 flex justify-between text-xs font-bold">
                  <span>
                    Progress
                  </span>

                  <span className="text-cyan-500">
                    {Math.round(
                      progress
                    )}
                    %
                  </span>
                </div>

                <div
                  className={`h-2 rounded-full ${themeStyles.progress}`}
                >
                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <header
          className={`relative z-50 flex min-h-[72px] shrink-0 items-center justify-between gap-3 px-4 sm:px-6 ${themeStyles.nav}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className={`rounded-xl p-2 md:hidden ${themeStyles.button}`}
              title="Open menu"
            >
              <Menu size={20} />
            </button>

            <button
              onClick={() =>
                navigate("/")
              }
              className={`hidden rounded-xl p-2 sm:block ${themeStyles.button}`}
              title="Home"
            >
              <Home size={18} />
            </button>

            <div className="min-w-0">
              <h1 className="max-w-[240px] truncate text-sm font-black sm:max-w-[420px] sm:text-base">
                {novel.title ||
                  "Untitled Book"}
              </h1>

              <div
                className={`mt-0.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider ${themeStyles.secondary}`}
              >
                <span>
                  Premium Reader
                </span>

                <span>•</span>

                <span>
                  {Math.round(
                    progress
                  )}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() =>
                setSearchOpen(
                  (value) => !value
                )
              }
              className={`rounded-xl p-2 ${themeStyles.button}`}
              title="Search book"
            >
              <Search size={18} />
            </button>

            <button
              onClick={
                toggleBookmark
              }
              className={`hidden rounded-xl p-2 sm:block ${themeStyles.button}`}
              title={
                currentBookmark
                  ? "Remove bookmark"
                  : "Bookmark page"
              }
            >
              {currentBookmark ? (
                <BookmarkCheck
                  size={18}
                  className="text-cyan-500"
                />
              ) : (
                <Bookmark
                  size={18}
                />
              )}
            </button>

            <button
              onClick={speak}
              className={`rounded-xl p-2 ${themeStyles.button}`}
              title={
                isSpeaking
                  ? "Stop reading"
                  : "Read aloud"
              }
            >
              {isSpeaking ? (
                <VolumeX
                  size={18}
                  className="text-cyan-500"
                />
              ) : (
                <Volume2
                  size={18}
                />
              )}
            </button>

            <button
              onClick={() =>
                setFontSize(
                  (value) =>
                    clamp(
                      value - 1,
                      14,
                      32
                    )
                )
              }
              className={`hidden rounded-xl px-3 py-2 text-xs font-black sm:block ${themeStyles.button}`}
              title="Decrease text size"
            >
              A−
            </button>

            <button
              onClick={() =>
                setFontSize(
                  (value) =>
                    clamp(
                      value + 1,
                      14,
                      32
                    )
                )
              }
              className={`hidden rounded-xl px-3 py-2 text-sm font-black sm:block ${themeStyles.button}`}
              title="Increase text size"
            >
              A+
            </button>

            <button
              onClick={() =>
                setSettingsOpen(
                  (value) => !value
                )
              }
              className={`rounded-xl p-2 ${
                settingsOpen
                  ? "bg-cyan-500/15 text-cyan-500"
                  : ""
              } ${themeStyles.button}`}
              title="Reader settings"
            >
              <Settings2
                size={18}
              />
            </button>

            <button
              onClick={
                toggleFullscreen
              }
              className={`hidden rounded-xl p-2 sm:block ${themeStyles.button}`}
              title={
                isFullscreen
                  ? "Exit fullscreen"
                  : "Fullscreen"
              }
            >
              {isFullscreen ? (
                <Minimize2
                  size={18}
                />
              ) : (
                <Maximize2
                  size={18}
                />
              )}
            </button>
          </div>
        </header>

        {/* ====================================================
            SEARCH PANEL
        ==================================================== */}

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -12,
              }}
              className={`relative z-40 border-b ${themeStyles.nav}`}
            >
              <div className="mx-auto max-w-5xl px-4 py-4">
                <form
                  onSubmit={
                    handleSearchSubmit
                  }
                  className={`flex items-center gap-3 rounded-2xl border p-2 ${themeStyles.card}`}
                >
                  <Search
                    size={19}
                    className="ml-2 shrink-0 text-cyan-500"
                  />

                  <input
                    ref={
                      searchInputRef
                    }
                    autoFocus
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search chapters and book content..."
                    className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-500"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                      className={`rounded-xl p-2 ${themeStyles.button}`}
                    >
                      <X size={16} />
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={
                      !searchResults.length
                    }
                    className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-black text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Find
                  </button>
                </form>

                {search.trim() && (
                  <div className="mt-3">
                    {searchResults.length ===
                    0 ? (
                      <div
                        className={`rounded-2xl p-4 text-sm ${themeStyles.card} ${themeStyles.secondary}`}
                      >
                        No matches found.
                      </div>
                    ) : (
                      <div className="max-h-64 space-y-2 overflow-y-auto">
                        {searchResults.map(
                          (
                            result
                          ) => (
                            <button
                              key={
                                result.index
                              }
                              onClick={() => {
                                goToStep(
                                  result.index
                                );

                                setSearchOpen(
                                  false
                                );
                              }}
                              className={`w-full rounded-2xl p-4 text-left transition hover:border-cyan-500 ${themeStyles.card}`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-black">
                                    {
                                      result.title
                                    }
                                  </p>

                                  <p
                                    className={`mt-1 text-xs ${themeStyles.secondary}`}
                                  >
                                    {result.type ===
                                    "chapter"
                                      ? `Chapter ${
                                          result.number
                                        }`
                                      : result.type ===
                                        "intro"
                                      ? "Introduction"
                                      : "Book Cover"}
                                  </p>
                                </div>

                                <LocateFixed
                                  size={
                                    16
                                  }
                                  className="shrink-0 text-cyan-500"
                                />
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====================================================
            SETTINGS
        ==================================================== */}

        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
              className="relative z-40 overflow-hidden"
            >
              <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
                <div
                  className={`${themeStyles.card} overflow-hidden rounded-[28px]`}
                >
                  {/* SETTINGS HEADER */}

                  <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 dark:border-white/10 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                        <SlidersHorizontal
                          size={19}
                        />
                      </div>

                      <div>
                        <h2 className="font-black">
                          Reader Settings
                        </h2>

                        <p
                          className={`text-xs ${themeStyles.secondary}`}
                        >
                          Customize your reading experience
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setSettingsOpen(
                          false
                        )
                      }
                      className={`rounded-xl p-2 ${themeStyles.button}`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* SETTINGS BODY */}

                  <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
                    {/* THEME */}

                    <SettingCard
                      icon={
                        theme ===
                        "light" ? (
                          <Sun
                            size={
                              17
                            }
                          />
                        ) : theme ===
                          "sepia" ? (
                          <Coffee
                            size={
                              17
                            }
                          />
                        ) : theme ===
                          "forest" ? (
                          <Leaf
                            size={
                              17
                            }
                          />
                        ) : (
                          <Moon
                            size={
                              17
                            }
                          />
                        )
                      }
                      title="Theme"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            value:
                              "dark",
                            label:
                              "Dark",
                            icon: (
                              <Moon
                                size={
                                  15
                                }
                              />
                            ),
                          },
                          {
                            value:
                              "light",
                            label:
                              "Light",
                            icon: (
                              <Sun
                                size={
                                  15
                                }
                              />
                            ),
                          },
                          {
                            value:
                              "sepia",
                            label:
                              "Sepia",
                            icon: (
                              <Coffee
                                size={
                                  15
                                }
                              />
                            ),
                          },
                          {
                            value:
                              "forest",
                            label:
                              "Forest",
                            icon: (
                              <Leaf
                                size={
                                  15
                                }
                              />
                            ),
                          },
                        ].map(
                          (
                            item
                          ) => (
                            <button
                              key={
                                item.value
                              }
                              onClick={() =>
                                setTheme(
                                  item.value
                                )
                              }
                              className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                                theme ===
                                item.value
                                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-500"
                                  : themeStyles.button
                              }`}
                            >
                              {
                                item.icon
                              }

                              {
                                item.label
                              }

                              {theme ===
                                item.value && (
                                <Check
                                  size={
                                    14
                                  }
                                  className="ml-auto"
                                />
                              )}
                            </button>
                          )
                        )}
                      </div>
                    </SettingCard>

                    {/* FONT */}

                    <SettingCard
                      icon={
                        <Type
                          size={17}
                        />
                      }
                      title={`Text Size • ${fontSize}px`}
                    >
                      <input
                        type="range"
                        min="14"
                        max="32"
                        step="1"
                        value={
                          fontSize
                        }
                        onChange={(
                          event
                        ) =>
                          setFontSize(
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        }
                        className="w-full accent-cyan-500"
                      />

                      <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-500">
                        <span>
                          Small
                        </span>

                        <span>
                          Large
                        </span>
                      </div>
                    </SettingCard>

                    {/* LINE HEIGHT */}

                    <SettingCard
                      icon={
                        <List
                          size={17}
                        />
                      }
                      title={`Line Spacing • ${lineHeight.toFixed(
                        1
                      )}`}
                    >
                      <input
                        type="range"
                        min="1.4"
                        max="2.6"
                        step="0.1"
                        value={
                          lineHeight
                        }
                        onChange={(
                          event
                        ) =>
                          setLineHeight(
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        }
                        className="w-full accent-cyan-500"
                      />

                      <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-500">
                        <span>
                          Compact
                        </span>

                        <span>
                          Relaxed
                        </span>
                      </div>
                    </SettingCard>

                    {/* WIDTH */}

                    <SettingCard
                      icon={
                        <PanelsTopLeft
                          size={17}
                        />
                      }
                      title="Reading Width"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          [
                            "3xl",
                            "Compact",
                          ],
                          [
                            "4xl",
                            "Comfort",
                          ],
                          [
                            "5xl",
                            "Wide",
                          ],
                          [
                            "6xl",
                            "Extra Wide",
                          ],
                        ].map(
                          ([
                            value,
                            label,
                          ]) => (
                            <button
                              key={
                                value
                              }
                              onClick={() =>
                                setReadingWidth(
                                  value
                                )
                              }
                              className={`rounded-xl border px-2 py-2 text-[10px] font-black transition ${
                                readingWidth ===
                                value
                                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-500"
                                  : themeStyles.button
                              }`}
                            >
                              {
                                label
                              }
                            </button>
                          )
                        )}
                      </div>
                    </SettingCard>

                    {/* VOICE */}

                    <div className="lg:col-span-2">
                      <SettingCard
                        icon={
                          <Volume2
                            size={
                              17
                            }
                          />
                        }
                        title="Voice"
                      >
                        {voices.length >
                        0 ? (
                          <select
                            value={
                              selectedVoice
                            }
                            onChange={(
                              event
                            ) =>
                              setSelectedVoice(
                                event
                                  .target
                                  .value
                              )
                            }
                            className={`w-full rounded-xl border p-3 text-xs outline-none ${themeStyles.input}`}
                          >
                            {voices.map(
                              (
                                voice,
                                index
                              ) => (
                                <option
                                  key={`${voice.name}-${voice.lang}-${index}`}
                                  value={
                                    voice.name
                                  }
                                >
                                  {
                                    voice.name
                                  }{" "}
                                  •{" "}
                                  {
                                    voice.lang
                                  }
                                </option>
                              )
                            )}
                          </select>
                        ) : (
                          <div
                            className={`rounded-xl p-3 text-xs ${themeStyles.progress} ${themeStyles.secondary}`}
                          >
                            Browser voices are
                            still loading or
                            speech synthesis is
                            unavailable.
                          </div>
                        )}
                      </SettingCard>
                    </div>

                    {/* SPEED */}

                    <SettingCard
                      icon={
                        <Play
                          size={17}
                        />
                      }
                      title={`Speech Speed • ${voiceRate.toFixed(
                        1
                      )}x`}
                    >
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={
                          voiceRate
                        }
                        onChange={(
                          event
                        ) =>
                          setVoiceRate(
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        }
                        className="w-full accent-cyan-500"
                      />

                      <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-500">
                        <span>
                          Slow
                        </span>

                        <span>
                          Fast
                        </span>
                      </div>
                    </SettingCard>

                    {/* PITCH */}

                    <SettingCard
                      icon={
                        <Volume2
                          size={17}
                        />
                      }
                      title={`Voice Pitch • ${voicePitch.toFixed(
                        1
                      )}`}
                    >
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={
                          voicePitch
                        }
                        onChange={(
                          event
                        ) =>
                          setVoicePitch(
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        }
                        className="w-full accent-cyan-500"
                      />

                      <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-500">
                        <span>
                          Low
                        </span>

                        <span>
                          High
                        </span>
                      </div>
                    </SettingCard>
                  </div>

                  {/* SHORTCUTS */}

                  <div className="border-t border-black/10 px-5 py-4 dark:border-white/10 sm:px-6">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-bold text-slate-500">
                      <span>
                        ← → Navigate
                      </span>

                      <span>
                        Space Read aloud
                      </span>

                      <span>
                        B Bookmark
                      </span>

                      <span>
                        F Fullscreen
                      </span>

                      <span>
                        S Settings
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====================================================
            PROGRESS BAR
        ==================================================== */}

        <div
          className={`relative z-30 h-1 shrink-0 ${themeStyles.progress}`}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500"
            animate={{
              width: `${progress}%`,
            }}
            transition={{
              duration: 0.5,
            }}
          />
        </div>

        {/* ====================================================
            READING AREA
        ==================================================== */}

        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto scroll-smooth px-3 py-6 sm:px-6 sm:py-10"
        >
          <div
            className={`mx-auto w-full transition-all duration-300 ${getReadingWidthClass(
              readingWidth
            )}`}
          >
            {/* =================================================
                COVER
            ================================================= */}

            {coverPage ? (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.45,
                }}
                className={`${themeStyles.card} overflow-hidden rounded-[32px]`}
              >
                {/* COVER IMAGE */}

                {novel.cover_url ? (
                  <div className="relative">
                    <img
                      src={
                        novel.cover_url
                      }
                      alt={
                        novel.title ||
                        "Book cover"
                      }
                      className="h-[360px] w-full object-cover sm:h-[520px]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-black text-cyan-300 backdrop-blur-xl">
                        <Sparkles
                          size={15}
                        />

                        PREMIUM READER
                      </div>

                      <h1 className="text-3xl font-black text-white sm:text-5xl">
                        {novel.title ||
                          "Untitled Book"}
                      </h1>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[360px] items-center justify-center bg-gradient-to-br from-cyan-600/20 to-violet-600/20 sm:h-[520px]">
                    <BookOpen
                      size={80}
                      className="text-cyan-500"
                    />
                  </div>
                )}

                {/* COVER CONTENT */}

                <div className="p-6 sm:p-10">
                  <p
                    className={`max-w-3xl text-base leading-8 sm:text-lg ${themeStyles.secondary}`}
                  >
                    {novel.description ||
                      "Begin your reading journey."}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      onClick={
                        continueReading
                      }
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-black shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 ${themeStyles.accent}`}
                    >
                      <Play
                        size={18}
                        fill="currentColor"
                      />

                      {lastRead
                        ? "Continue Reading"
                        : "Start Reading"}
                    </button>

                    <button
                      onClick={
                        restartBook
                      }
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 font-bold transition ${themeStyles.button}`}
                    >
                      <RotateCcw
                        size={18}
                      />

                      Restart
                    </button>
                  </div>

                  {lastRead && (
                    <div
                      className={`mt-7 flex flex-wrap items-center gap-3 text-xs font-semibold ${themeStyles.secondary}`}
                    >
                      <Clock3
                        size={16}
                        className="text-cyan-500"
                      />

                      Last opened{" "}
                      {lastRead.updatedAt
                        ? new Date(
                            lastRead.updatedAt
                          ).toLocaleString()
                        : "Previously"}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* =================================================
                 CONTENT
              ================================================= */

              <motion.article
                key={stepIndex}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.35,
                }}
                className={`${themeStyles.card} rounded-[32px] p-6 sm:p-10 lg:p-14`}
              >
                {/* CHAPTER LABEL */}

                {current.type ===
                  "chapter" && (
                  <div className="mb-5 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-xs font-black text-cyan-500">
                      <BookOpen
                        size={14}
                      />

                      Chapter{" "}
                      {current.number}
                    </div>

                    <button
                      onClick={
                        toggleBookmark
                      }
                      className={`rounded-xl p-2 ${themeStyles.button}`}
                      title={
                        currentBookmark
                          ? "Remove bookmark"
                          : "Bookmark"
                      }
                    >
                      {currentBookmark ? (
                        <BookmarkCheck
                          size={
                            18
                          }
                          className="text-cyan-500"
                        />
                      ) : (
                        <Bookmark
                          size={
                            18
                          }
                        />
                      )}
                    </button>
                  </div>
                )}

                {/* INTRO LABEL */}

                {current.type ===
                  "intro" && (
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-xs font-black text-cyan-500">
                    <Sparkles
                      size={14}
                    />

                    Introduction
                  </div>
                )}

                {/* TITLE */}

                <h1 className="mb-10 text-center text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                  {current.title ||
                    "Untitled Section"}
                </h1>

                {/* CONTENT */}

                <div
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight:
                      lineHeight,
                  }}
                  className={`whitespace-pre-wrap break-words font-serif tracking-[0.01em] transition-all duration-300 ${themeStyles.secondary}`}
                >
                  {current.content ||
                    "No content available for this section."}
                </div>

                {/* NAVIGATION */}

                <div className="mt-16 grid grid-cols-2 gap-3 border-t border-black/10 pt-8 dark:border-white/10">
                  <button
                    disabled={
                      stepIndex <= 1
                    }
                    onClick={
                      previousPage
                    }
                    className={`group flex min-w-0 items-center gap-2 rounded-2xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-30 ${themeStyles.button}`}
                  >
                    <ChevronLeft
                      size={19}
                      className="shrink-0 transition group-hover:-translate-x-1"
                    />

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Previous
                      </p>

                      <p className="truncate text-xs font-black sm:text-sm">
                        {stepIndex >
                        1
                          ? flow[
                              stepIndex -
                                1
                            ]?.title ||
                            "Previous"
                          : "Beginning"}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={
                      nextPage
                    }
                    className={`group flex min-w-0 items-center justify-end gap-2 rounded-2xl px-4 py-4 text-right transition ${themeStyles.accent}`}
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        {stepIndex <
                        flow.length -
                          1
                          ? "Next"
                          : "Finished"}
                      </p>

                      <p className="truncate text-xs font-black sm:text-sm">
                        {stepIndex <
                        flow.length -
                          1
                          ? flow[
                              stepIndex +
                                1
                            ]?.title ||
                            "Next section"
                          : "Back to Cover"}
                      </p>
                    </div>

                    <ChevronRight
                      size={19}
                      className="shrink-0 transition group-hover:translate-x-1"
                    />
                  </button>
                </div>

                {/* POSITION */}

                <div className="mt-5 text-center">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.2em] ${themeStyles.muted}`}
                  >
                    Section{" "}
                    {stepIndex + 1}{" "}
                    of {flow.length}
                  </span>
                </div>
              </motion.article>
            )}

            {/* =================================================
                REVIEWS
            ================================================= */}

            <div className="mt-10">
              <button
                onClick={() =>
                  setShowReviews(
                    (value) =>
                      !value
                  )
                }
                className={`${themeStyles.card} flex w-full items-center justify-between rounded-2xl p-5 text-left transition hover:border-cyan-500/40`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Star
                      size={18}
                      className="text-cyan-500"
                    />

                    <h2 className="font-black">
                      Reader Reviews
                    </h2>
                  </div>

                  <p
                    className={`mt-1 text-xs ${themeStyles.secondary}`}
                  >
                    See what other readers think
                  </p>
                </div>

                <motion.div
                  animate={{
                    rotate:
                      showReviews
                        ? 90
                        : 0,
                  }}
                >
                  <ChevronRight
                    size={19}
                  />
                </motion.div>
              </button>

              <AnimatePresence>
                {showReviews && (
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="pt-5">
                      <ReaderReviews
                        novelId={id}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* =================================================
                FOOT READER CONTROLS
            ================================================= */}

            <div className="flex flex-wrap items-center justify-center gap-3 py-10">
              <button
                onClick={
                  scrollTop
                }
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold ${themeStyles.button}`}
              >
                <ArrowLeft
                  size={15}
                  className="rotate-90"
                />

                Top
              </button>

              <button
                onClick={
                  toggleBookmark
                }
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold ${themeStyles.button}`}
              >
                {currentBookmark ? (
                  <BookmarkCheck
                    size={15}
                    className="text-cyan-500"
                  />
                ) : (
                  <Bookmark
                    size={15}
                  />
                )}

                {currentBookmark
                  ? "Bookmarked"
                  : "Bookmark"}
              </button>

              <button
                onClick={speak}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold ${themeStyles.button}`}
              >
                {isSpeaking ? (
                  <>
                    <Pause
                      size={15}
                    />

                    Stop Reading
                  </>
                ) : (
                  <>
                    <Volume2
                      size={15}
                    />

                    Read Aloud
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR BUTTON
============================================================ */

function SidebarButton({
  collapsed,
  icon,
  label,
  subtitle,
  active,
  themeStyles,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      title={
        collapsed
          ? label
          : undefined
      }
      className={`mb-1.5 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
        active
          ? "bg-cyan-500/15 text-cyan-500"
          : ""
      } ${
        collapsed
          ? "justify-center"
          : ""
      } hover:bg-cyan-500/10`}
    >
      <span
        className={
          active
            ? "text-cyan-500"
            : themeStyles.icon
        }
      >
        {icon}
      </span>

      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">
            {label}
          </p>

          {subtitle && (
            <p
              className={`mt-0.5 truncate text-[10px] ${themeStyles.secondary}`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </button>
  );
}

/* ============================================================
   MOBILE NAV BUTTON
============================================================ */

function MobileNavButton({
  icon,
  label,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
        active
          ? "bg-cyan-500/15 text-cyan-500"
          : "hover:bg-cyan-500/10"
      }`}
    >
      {icon}

      <span className="truncate">
        {label}
      </span>
    </button>
  );
}

/* ============================================================
   SETTING CARD
============================================================ */

function SettingCard({
  icon,
  title,
  children,
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
          {icon}
        </div>

        <p className="text-xs font-black">
          {title}
        </p>
      </div>

      {children}
    </div>
  );
}