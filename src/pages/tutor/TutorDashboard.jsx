import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FolderOpen,
  GraduationCap,
  Loader2,
  MoreHorizontal,
  PenTool,
  Plus,
  Radio,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";


/* ============================================================
   STORAGE
============================================================ */

const ACADEMY_USER_KEY =
  "scholiqen_academy_user";

const TUTOR_REFERENCE_KEYS = [
  "tutorReference",
  "tutor",
  "academyTutor",
  "scholiqen_user",
];


/* ============================================================
   ROUTES
============================================================ */

const LIVE_CLASS_ROUTE =
  "/academy/tutor/live";


/* ============================================================
   API
============================================================ */

const API_BASE_URL =
  (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");


/* ============================================================
   POLLING
============================================================ */

const REFRESH_INTERVAL =
  15000;


/* ============================================================
   HELPERS
============================================================ */

const safeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
};


const getArrayFromResponse = (
  response,
  keys = []
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(response[key])) {
      return response[key];
    }
  }

  if (
    response.data &&
    typeof response.data === "object"
  ) {
    for (const key of keys) {
      if (Array.isArray(response.data[key])) {
        return response.data[key];
      }
    }
  }

  return [];
};


const firstDefined = (
  object,
  keys,
  fallback = null
) => {
  if (!object || typeof object !== "object") {
    return fallback;
  }

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null
    ) {
      return object[key];
    }
  }

  return fallback;
};


const toNumber = (
  value,
  fallback = 0
) => {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};


const formatDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};


const formatTime = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
};


const getActivityLabel = (
  activity
) => {
  const type =
    String(
      firstDefined(
        activity,
        [
          "activityType",
          "activity_type",
          "type",
        ],
        "Activity"
      )
    );

  const labels = {
    live_class: "Live Class",
    live: "Live Class",
    task: "Task",
    assignment: "Assignment",
    material: "Material",
    lesson: "Lesson",
    submission: "Submission",
    attendance: "Attendance",
    class: "Class",
  };

  return (
    labels[type.toLowerCase()] ||
    type.replace(/_/g, " ")
  );
};


const getActivityDate = (
  activity
) => {
  return firstDefined(
    activity,
    [
      "createdAt",
      "created_at",
      "startedAt",
      "started_at",
      "updatedAt",
      "updated_at",
    ],
    null
  );
};


/* ============================================================
   API REQUEST
============================================================ */

const request = async (
  endpoint,
  tutorReference,
  options = {}
) => {
  const url =
    `${API_BASE_URL}${endpoint}`;

  const headers = {
    Accept:
      "application/json",

    ...(options.body
      ? {
          "Content-Type":
            "application/json",
        }
      : {}),

    "x-tutor-reference":
      tutorReference,
  };

  const response =
    await fetch(
      url,
      {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      }
    );

  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      firstDefined(
        data,
        [
          "message",
          "error",
        ],
        `Request failed with status ${response.status}`
      );

    throw new Error(
      message
    );
  }

  return data;
};


/* ============================================================
   COMPONENT
============================================================ */

const TutorDashboard = () => {
  const navigate =
    useNavigate();

  const mountedRef =
    useRef(true);

  const [showQuickActions, setShowQuickActions] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);


  /* ==========================================================
     TUTOR SESSION
  ========================================================== */

  const tutor = useMemo(() => {
    try {
      const stored =
        localStorage.getItem(
          ACADEMY_USER_KEY
        );

      if (!stored) {
        return null;
      }

      return JSON.parse(
        stored
      );
    } catch (error) {
      console.error(
        "Unable to read tutor session:",
        error
      );

      return null;
    }
  }, []);


  /* ==========================================================
     TUTOR REFERENCE
  ========================================================== */

  const tutorReference = useMemo(() => {
    for (
      const key of TUTOR_REFERENCE_KEYS
    ) {
      const stored =
        localStorage.getItem(
          key
        );

      if (!stored) {
        continue;
      }

      try {
        const parsed =
          JSON.parse(
            stored
          );

        if (
          typeof parsed ===
          "string"
        ) {
          return parsed;
        }

        if (
          parsed &&
          typeof parsed ===
          "object"
        ) {
          const reference =
            firstDefined(
              parsed,
              [
                "reference",
                "tutorReference",
                "tutor_reference",
                "applicationReference",
                "application_reference",
              ],
              ""
            );

          if (reference) {
            return String(
              reference
            ).trim();
          }
        }
      } catch {
        if (
          String(stored).trim()
        ) {
          return String(
            stored
          ).trim();
        }
      }
    }

    if (tutor) {
      const reference =
        firstDefined(
          tutor,
          [
            "reference",
            "tutorReference",
            "tutor_reference",
            "applicationReference",
            "application_reference",
          ],
          ""
        );

      if (reference) {
        return String(
          reference
        ).trim();
      }
    }

    return "";
  }, [tutor]);


  /* ==========================================================
     TUTOR NAME
  ========================================================== */

  const tutorName = useMemo(() => {
    if (!tutor) {
      return "Tutor";
    }

    return [
      tutor.firstName,
      tutor.middleName,
      tutor.lastName,
      tutor.first_name,
      tutor.middle_name,
      tutor.last_name,
      tutor.fullName,
      tutor.full_name,
      tutor.name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || "Tutor";
  }, [tutor]);


  const firstName =
    tutorName.split(" ")[0] ||
    "Tutor";


  /* ==========================================================
     LIVE DATA
  ========================================================== */

  const [classes, setClasses] =
    useState([]);

  const [tasks, setTasks] =
    useState([]);

  const [submissions, setSubmissions] =
    useState([]);

  const [liveClasses, setLiveClasses] =
    useState([]);

  const [activities, setActivities] =
    useState([]);


  /* ==========================================================
     LOAD CLASSES
  ========================================================== */

  const loadClasses =
    useCallback(
      async (
        reference
      ) => {
        const query =
          `?reference=${encodeURIComponent(
            reference
          )}`;

        const response =
          await request(
            `/api/academy/tutor/classes${query}`,
            reference
          );

        const result =
          getArrayFromResponse(
            response,
            [
              "classes",
              "registeredClasses",
              "results",
              "rows",
            ]
          );

        return {
          items: safeArray(
            result
          ),
          response,
        };
      },
      []
    );


  /* ==========================================================
     LOAD TASKS
  ========================================================== */

  const loadTasks =
    useCallback(
      async (
        reference
      ) => {
        const query =
          `?reference=${encodeURIComponent(
            reference
          )}`;

        const response =
          await request(
            `/api/academy/tutor/tasks${query}`,
            reference
          );

        const result =
          getArrayFromResponse(
            response,
            [
              "tasks",
              "results",
              "rows",
            ]
          );

        return safeArray(
          result
        );
      },
      []
    );


  /* ==========================================================
     LOAD SUBMISSIONS
  ========================================================== */

  const loadSubmissions =
    useCallback(
      async (
        reference
      ) => {
        const query =
          `?reference=${encodeURIComponent(
            reference
          )}`;

        const response =
          await request(
            `/api/academy/tutor/tasks/submissions${query}`,
            reference
          );

        return getArrayFromResponse(
          response,
          [
            "submissions",
            "results",
            "rows",
          ]
        );
      },
      []
    );


  /* ==========================================================
     LOAD LIVE CLASSES
  ========================================================== */

  const loadLiveClasses =
    useCallback(
      async (
        reference
      ) => {
        const query =
          `?reference=${encodeURIComponent(
            reference
          )}`;

        const response =
          await request(
            `/api/academy/tutor/live-classes${query}`,
            reference
          );

        return getArrayFromResponse(
          response,
          [
            "liveClasses",
            "live_classes",
            "classes",
            "results",
            "rows",
          ]
        );
      },
      []
    );


  /* ==========================================================
     LOAD CLASS ACTIVITIES
  ========================================================== */

  const loadActivities =
    useCallback(
      async (
        reference,
        classList
      ) => {
        const uniqueClasses =
          safeArray(
            classList
          ).slice(
            0,
            20
          );

        if (
          uniqueClasses.length === 0
        ) {
          return [];
        }

        const requests =
          uniqueClasses.map(
            async (item) => {
              const grade =
                firstDefined(
                  item,
                  [
                    "grade",
                    "classGrade",
                    "class_grade",
                  ],
                  ""
                );

              const subjects =
                safeArray(
                  firstDefined(
                    item,
                    [
                      "subjects",
                    ],
                    []
                  )
                );

              if (
                subjects.length === 0
              ) {
                return [];
              }

              const activityRequests =
                subjects
                  .slice(
                    0,
                    10
                  )
                  .map(
                    async (
                      subject
                    ) => {
                      const subjectName =
                        typeof subject ===
                        "string"
                          ? subject
                          : firstDefined(
                              subject,
                              [
                                "name",
                                "subject",
                                "title",
                              ],
                              ""
                            );

                      if (
                        !subjectName
                      ) {
                        return [];
                      }

                      const query =
                        `?reference=${encodeURIComponent(
                          reference
                        )}&grade=${encodeURIComponent(
                          grade
                        )}&subject=${encodeURIComponent(
                          subjectName
                        )}`;

                      try {
                        const response =
                          await request(
                            `/api/academy/tutor/class-activities${query}`,
                            reference
                          );

                        return getArrayFromResponse(
                          response,
                          [
                            "activities",
                            "results",
                            "rows",
                          ]
                        );
                      } catch (
                        activityError
                      ) {
                        console.warn(
                          "Unable to load class activity:",
                          activityError
                        );

                        return [];
                      }
                    }
                  );

              const results =
                await Promise.all(
                  activityRequests
                );

              return results.flat();
            }
          );

        const results =
          await Promise.all(
            requests
          );

        return results.flat();
      },
      []
    );


  /* ==========================================================
     LOAD EVERYTHING
  ========================================================== */

  const loadDashboard =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (
          !tutorReference
        ) {
          setLoading(false);
          setError(
            "Tutor session not found. Please log in again."
          );
          return;
        }

        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        try {
          setError("");

          /*
           * Run the main dashboard requests
           * together so the dashboard checks
           * all live sources at the same time.
           */

          const [
            classResult,
            taskResult,
            submissionResult,
            liveResult,
          ] =
            await Promise.allSettled([
              loadClasses(
                tutorReference
              ),

              loadTasks(
                tutorReference
              ),

              loadSubmissions(
                tutorReference
              ),

              loadLiveClasses(
                tutorReference
              ),
            ]);

          if (
            !mountedRef.current
          ) {
            return;
          }


          /* ----------------------------------------------
             CLASSES
          ---------------------------------------------- */

          let loadedClasses =
            [];

          if (
            classResult.status ===
            "fulfilled"
          ) {
            loadedClasses =
              classResult.value.items;

            setClasses(
              loadedClasses
            );
          } else {
            console.warn(
              "Classes request failed:",
              classResult.reason
            );
          }


          /* ----------------------------------------------
             TASKS
          ---------------------------------------------- */

          if (
            taskResult.status ===
            "fulfilled"
          ) {
            setTasks(
              safeArray(
                taskResult.value
              )
            );
          } else {
            console.warn(
              "Tasks request failed:",
              taskResult.reason
            );
          }


          /* ----------------------------------------------
             SUBMISSIONS
          ---------------------------------------------- */

          if (
            submissionResult.status ===
            "fulfilled"
          ) {
            setSubmissions(
              safeArray(
                submissionResult.value
              )
            );
          } else {
            console.warn(
              "Submissions request failed:",
              submissionResult.reason
            );
          }


          /* ----------------------------------------------
             LIVE CLASSES
          ---------------------------------------------- */

          if (
            liveResult.status ===
            "fulfilled"
          ) {
            setLiveClasses(
              safeArray(
                liveResult.value
              )
            );
          } else {
            console.warn(
              "Live classes request failed:",
              liveResult.reason
            );
          }


          /* ----------------------------------------------
             CLASS ACTIVITIES
          ---------------------------------------------- */

          const activityData =
            await loadActivities(
              tutorReference,
              loadedClasses
            );

          if (
            mountedRef.current
          ) {
            setActivities(
              safeArray(
                activityData
              )
            );
          }


          /* ----------------------------------------------
             SUCCESS
          ---------------------------------------------- */

          if (
            mountedRef.current
          ) {
            setLastUpdated(
              new Date()
            );
          }

        } catch (
          dashboardError
        ) {
          console.error(
            "Tutor dashboard refresh error:",
            dashboardError
          );

          if (
            mountedRef.current
          ) {
            setError(
              dashboardError.message ||
                "Unable to refresh dashboard."
            );
          }
        } finally {
          if (
            mountedRef.current
          ) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      },
      [
        tutorReference,
        loadClasses,
        loadTasks,
        loadSubmissions,
        loadLiveClasses,
        loadActivities,
      ]
    );


  /* ==========================================================
     INITIAL LOAD + LIVE POLLING
  ========================================================== */

  useEffect(() => {
    mountedRef.current =
      true;

    loadDashboard();

    const interval =
      window.setInterval(
        () => {
          loadDashboard({
            silent: true,
          });
        },
        REFRESH_INTERVAL
      );

    return () => {
      mountedRef.current =
        false;

      window.clearInterval(
        interval
      );
    };
  }, [
    loadDashboard,
  ]);


  /* ==========================================================
     LIVE WINDOW REFRESH
  ========================================================== */

  useEffect(() => {
    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          loadDashboard({
            silent: true,
          });
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [
    loadDashboard,
  ]);


  /* ==========================================================
     CALCULATED STATS
  ========================================================== */

  const totalClasses =
    classes.length;


  const totalStudents =
    useMemo(() => {
      const ids =
        new Set();

      classes.forEach(
        (item) => {
          safeArray(
            item.students
          ).forEach(
            (student) => {
              const id =
                firstDefined(
                  student,
                  [
                    "id",
                    "studentId",
                    "student_id",
                    "enrollmentId",
                    "enrollment_id",
                    "email",
                  ],
                  JSON.stringify(
                    student
                  )
                );

              ids.add(
                String(id)
              );
            }
          );

          const count =
            firstDefined(
              item,
              [
                "verifiedStudentCount",
                "verified_student_count",
                "studentCount",
                "student_count",
              ],
              null
            );

          if (
            ids.size === 0 &&
            count !== null
          ) {
            for (
              let index = 0;
              index <
              toNumber(
                count
              );
              index += 1
            ) {
              ids.add(
                `${item.id || "class"}-${index}`
              );
            }
          }
        }
      );

      return ids.size;
    }, [
      classes,
    ]);


  const activeTasks =
    useMemo(() => {
      return tasks.filter(
        (task) => {
          const status =
            String(
              firstDefined(
                task,
                [
                  "status",
                  "taskStatus",
                  "task_status",
                ],
                "active"
              )
            ).toLowerCase();

          return ![
            "completed",
            "closed",
            "cancelled",
            "canceled",
            "archived",
            "expired",
          ].includes(
            status
          );
        }
      ).length;
    }, [
      tasks,
    ]);


  const pendingReviews =
    useMemo(() => {
      return submissions.filter(
        (submission) => {
          const status =
            String(
              firstDefined(
                submission,
                [
                  "status",
                  "submissionStatus",
                  "submission_status",
                ],
                "pending"
              )
            ).toLowerCase();

          return [
            "pending",
            "submitted",
            "awaiting_review",
            "awaiting-review",
            "ungraded",
            "review",
          ].includes(
            status
          );
        }
      ).length;
    }, [
      submissions,
    ]);


  const activeLiveClasses =
    useMemo(() => {
      return liveClasses.filter(
        (item) => {
          const status =
            String(
              firstDefined(
                item,
                [
                  "status",
                  "state",
                ],
                ""
              )
            ).toLowerCase();

          return (
            status === "live" ||
            status === "active" ||
            status === "started" ||
            Boolean(
              firstDefined(
                item,
                [
                  "isLive",
                  "is_live",
                ],
                false
              )
            )
          );
        }
      );
    }, [
      liveClasses,
    ]);


  /* ==========================================================
     STATS
  ========================================================== */

  const stats = [
    {
      title: "My Classes",
      value: String(
        totalClasses
      ),
      description:
        "Classes assigned to you",
      icon: BookOpen,
      iconClass:
        "text-cyan-300 bg-cyan-400/10 border-cyan-400/15",
      path:
        "/academy/tutor/classes",
    },

    {
      title: "Students",
      value: String(
        totalStudents
      ),
      description:
        "Students in your classes",
      icon: Users,
      iconClass:
        "text-violet-300 bg-violet-400/10 border-violet-400/15",
      path:
        "/academy/tutor/students",
    },

    {
      title: "Active Tasks",
      value: String(
        activeTasks
      ),
      description:
        "Tasks currently running",
      icon: ClipboardList,
      iconClass:
        "text-emerald-300 bg-emerald-400/10 border-emerald-400/15",
      path:
        "/academy/tutor/tasks",
    },

    {
      title: "Pending Reviews",
      value: String(
        pendingReviews
      ),
      description:
        "Submissions waiting for you",
      icon: Clock3,
      iconClass:
        "text-amber-300 bg-amber-400/10 border-amber-400/15",
      path:
        "/academy/tutor/tasks",
    },
  ];


  /* ==========================================================
     QUICK ACTIONS
  ========================================================== */

  const quickActions = [
    {
      title: "Create Task",
      description:
        "Give students something to work on",
      icon: ClipboardList,
      path:
        "/academy/tutor/tasks/create",
    },

    {
      title: "Start Live Class",
      description:
        "Open your live classroom and start teaching",
      icon: Radio,
      path:
        LIVE_CLASS_ROUTE,
    },

    {
      title: "Upload Material",
      description:
        "Add PDFs, slides or resources",
      icon: FolderOpen,
      path:
        "/academy/tutor/materials/upload",
    },

    {
      title: "Create Lesson",
      description:
        "Prepare your next lesson",
      icon: GraduationCap,
      path:
        "/academy/tutor/lessons/create",
    },
  ];


  /* ==========================================================
     RECENT ACTIVITY
  ========================================================== */

  const recentActivity =
    useMemo(() => {
      const combined = [
        ...activities,

        ...tasks.map(
          (task) => ({
            ...task,
            activityType:
              "task",
            title:
              firstDefined(
                task,
                [
                  "title",
                  "name",
                ],
                "Task created"
              ),
            createdAt:
              firstDefined(
                task,
                [
                  "createdAt",
                  "created_at",
                ],
                null
              ),
          })
        ),

        ...liveClasses.map(
          (live) => ({
            ...live,
            activityType:
              "live_class",
            title:
              firstDefined(
                live,
                [
                  "title",
                  "className",
                  "class_name",
                  "subject",
                ],
                "Live Class"
              ),
            createdAt:
              firstDefined(
                live,
                [
                  "createdAt",
                  "created_at",
                  "scheduledAt",
                  "scheduled_at",
                  "startedAt",
                  "started_at",
                ],
                null
              ),
          })
        ),
      ];

      const seen =
        new Set();

      return combined
        .filter(
          (item) => {
            const id =
              String(
                firstDefined(
                  item,
                  [
                    "id",
                    "activityId",
                    "activity_id",
                  ],
                  `${getActivityLabel(
                    item
                  )}-${getActivityDate(
                    item
                  )}-${firstDefined(
                    item,
                    ["title"],
                    ""
                  )}`
                )
              );

            if (
              seen.has(id)
            ) {
              return false;
            }

            seen.add(id);

            return true;
          }
        )
        .filter(
          (item) =>
            getActivityDate(
              item
            )
        )
        .sort(
          (a, b) => {
            const first =
              new Date(
                getActivityDate(
                  a
                )
              ).getTime();

            const second =
              new Date(
                getActivityDate(
                  b
                )
              ).getTime();

            return (
              second - first
            );
          }
        )
        .slice(
          0,
          8
        );
    }, [
      activities,
      tasks,
      liveClasses,
    ]);


  /* ==========================================================
     LIVE CLASS DISPLAY
  ========================================================== */

  const liveClassToShow =
    activeLiveClasses[0] ||
    liveClasses[0] ||
    null;


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-7">

      {/* =====================================================
          LIVE REFRESH BAR
      ===================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-2">

          <span
            className={`h-2 w-2 rounded-full ${
              loading
                ? "bg-amber-400"
                : "bg-emerald-400"
            }`}
          />

          <span className="text-[10px] font-bold text-slate-500">
            {loading
              ? "Checking Academy activity..."
              : "Dashboard is live"}
          </span>

          {lastUpdated && (
            <span className="text-[9px] text-slate-700">
              Updated{" "}
              {formatTime(
                lastUpdated
              )}
            </span>
          )}

        </div>

        <button
          type="button"
          onClick={() =>
            loadDashboard({
              silent: true,
            })
          }
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-[9px] font-bold text-slate-500 transition hover:border-cyan-400/20 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {refreshing ? (
            <Loader2
              size={12}
              className="animate-spin"
            />
          ) : (
            <RefreshCw
              size={12}
            />
          )}

          Refresh

        </button>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.045] p-4">

          <AlertCircle
            size={17}
            className="mt-0.5 shrink-0 text-red-300"
          />

          <div>

            <p className="text-xs font-bold text-red-200">
              Dashboard refresh issue
            </p>

            <p className="mt-1 text-[10px] leading-5 text-red-300/70">
              {error}
            </p>

          </div>

        </div>
      )}


      {/* =====================================================
          WELCOME
      ===================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.055] via-white/[0.025] to-cyan-400/[0.025] p-6 shadow-2xl shadow-black/20 sm:p-8"
      >

        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-400/[0.08] blur-[100px]" />

        <div className="pointer-events-none absolute bottom-[-100px] right-[25%] h-64 w-64 rounded-full bg-violet-500/[0.06] blur-[100px]" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

          <div className="max-w-2xl">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1.5">

              <Sparkles
                size={13}
                className="text-cyan-300"
              />

              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Tutor Workspace
              </span>

            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">

              Good to see you{" "}

              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                {firstName}
              </span>
              .

            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Your teaching workspace is ready.
              Manage your classes, create tasks,
              teach live classes, share materials,
              and monitor your students from one
              place.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">

              <button
                onClick={() =>
                  navigate(
                    "/academy/tutor/classes"
                  )
                }
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:shadow-cyan-500/20"
              >

                View My Classes

                <ArrowRight
                  size={14}
                  className="transition group-hover:translate-x-0.5"
                />

              </button>

              <button
                onClick={() =>
                  navigate(
                    LIVE_CLASS_ROUTE
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2.5 text-xs font-bold text-cyan-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.1] hover:text-cyan-200"
              >

                <Radio
                  size={14}
                />

                Start Live Class

              </button>

            </div>

          </div>


          {/* STATUS */}

          <div className="relative shrink-0">

            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.045] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">

                  <CheckCircle2
                    size={19}
                    className="text-emerald-300"
                  />

                </div>

                <div>

                  <p className="text-xs font-bold text-white">
                    Tutor Account
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                    <span className="text-[10px] font-semibold text-emerald-300">
                      Verified
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </motion.section>


      {/* =====================================================
          STATS
      ===================================================== */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="text-sm font-black text-white">
              Teaching Overview
            </h2>

            <p className="mt-1 text-[11px] text-slate-600">
              Live data from your Academy workspace
            </p>

          </div>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map(
            (
              stat,
              index
            ) => {

              const Icon =
                stat.icon;

              return (
                <motion.button
                  key={stat.title}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.35,
                    delay:
                      index * 0.07,
                  }}
                  onClick={() =>
                    navigate(
                      stat.path
                    )
                  }
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045]"
                >

                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/[0.025] blur-2xl transition group-hover:bg-cyan-400/[0.06]" />

                  <div className="relative flex items-start justify-between">

                    <div>

                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
                        {stat.title}
                      </p>

                      <p className="mt-2 text-3xl font-black tracking-tight text-white">
                        {loading ? (
                          <span className="inline-block h-8 w-10 animate-pulse rounded-lg bg-white/10" />
                        ) : (
                          stat.value
                        )}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {stat.description}
                      </p>

                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${stat.iconClass}`}
                    >

                      <Icon
                        size={18}
                      />

                    </div>

                  </div>

                  <div className="relative mt-4 flex items-center gap-1 text-[10px] font-bold text-slate-600 transition group-hover:text-cyan-300">

                    Open

                    <ArrowRight
                      size={12}
                      className="transition group-hover:translate-x-0.5"
                    />

                  </div>

                </motion.button>
              );
            }
          )}

        </div>

      </section>


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="text-sm font-black text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-[11px] text-slate-600">
              Start teaching activities quickly
            </p>

          </div>

          <button
            onClick={() =>
              setShowQuickActions(
                (value) =>
                  !value
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] font-bold text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          >

            <Plus
              size={14}
            />

            Actions

          </button>

        </div>

        {showQuickActions && (
          <div className="mb-3 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.025] px-4 py-2 text-[9px] font-semibold text-slate-500">
            Select an action below to continue.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {quickActions.map(
            (
              action,
              index
            ) => {

              const Icon =
                action.icon;

              return (
                <motion.button
                  key={action.title}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.05,
                  }}
                  onClick={() =>
                    navigate(
                      action.path
                    )
                  }
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-cyan-400/15 hover:bg-cyan-400/[0.025]"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-cyan-300 transition group-hover:border-cyan-400/20 group-hover:bg-cyan-400/10">

                      <Icon
                        size={17}
                      />

                    </div>

                    <ArrowRight
                      size={14}
                      className="text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-cyan-400"
                    />

                  </div>

                  <h3 className="mt-4 text-xs font-black text-white">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-slate-600">
                    {action.description}
                  </p>

                </motion.button>
              );
            }
          )}

        </div>

      </section>


      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">


        {/* ===================================================
            MY CLASSES
        =================================================== */}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

            <div>

              <h2 className="text-sm font-black text-white">
                My Classes
              </h2>

              <p className="mt-1 text-[10px] text-slate-600">
                Classes you teach
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  "/academy/tutor/classes"
                )
              }
              className="text-[10px] font-bold text-cyan-400 transition hover:text-cyan-300"
            >
              View all
            </button>

          </div>


          <div className="p-5">

            {loading &&
            classes.length ===
              0 ? (

              <LoadingState />

            ) : classes.length ===
              0 ? (

              <EmptyState
                icon={BookOpen}
                title="No classes yet"
                description="Your assigned classes will appear here once the Academy connects you with students."
                actionLabel="Go to Classes"
                onAction={() =>
                  navigate(
                    "/academy/tutor/classes"
                  )
                }
              />

            ) : (

              <div className="space-y-3">

                {classes
                  .slice(
                    0,
                    5
                  )
                  .map(
                    (
                      item,
                      index
                    ) => {

                      const grade =
                        firstDefined(
                          item,
                          [
                            "grade",
                            "classGrade",
                            "class_grade",
                          ],
                          "Class"
                        );

                      const className =
                        firstDefined(
                          item,
                          [
                            "className",
                            "class_name",
                            "name",
                          ],
                          "Assigned Class"
                        );

                      const studentCount =
                        firstDefined(
                          item,
                          [
                            "verifiedStudentCount",
                            "verified_student_count",
                            "studentCount",
                            "student_count",
                          ],
                          safeArray(
                            item.students
                          ).length
                        );

                      const subjects =
                        safeArray(
                          item.subjects
                        );

                      return (
                        <motion.button
                          key={
                            item.id ||
                            `${grade}-${className}-${index}`
                          }
                          initial={{
                            opacity: 0,
                            x: -10,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay:
                              index *
                              0.04,
                          }}
                          onClick={() =>
                            navigate(
                              "/academy/tutor/classes"
                            )
                          }
                          className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-cyan-400/15 hover:bg-cyan-400/[0.025]"
                        >

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05] text-cyan-300">

                              <BookOpen
                                size={16}
                              />

                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-xs font-black text-white">
                                {className}
                              </p>

                              <p className="mt-1 truncate text-[10px] text-slate-600">
                                {grade}

                                {" • "}

                                {toNumber(
                                  studentCount
                                )}{" "}
                                students
                              </p>

                              {subjects.length >
                                0 && (
                                <p className="mt-1 truncate text-[9px] text-slate-700">
                                  {subjects
                                    .slice(
                                      0,
                                      3
                                    )
                                    .map(
                                      (
                                        subject
                                      ) =>
                                        typeof subject ===
                                        "string"
                                          ? subject
                                          : firstDefined(
                                              subject,
                                              [
                                                "name",
                                                "subject",
                                                "title",
                                              ],
                                              ""
                                            )
                                    )
                                    .filter(
                                      Boolean
                                    )
                                    .join(
                                      " • "
                                    )}
                                </p>
                              )}

                            </div>

                          </div>

                          <ArrowRight
                            size={14}
                            className="shrink-0 text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-cyan-300"
                          />

                        </motion.button>
                      );
                    }
                  )}

                {classes.length >
                  5 && (
                  <button
                    onClick={() =>
                      navigate(
                        "/academy/tutor/classes"
                      )
                    }
                    className="w-full pt-2 text-center text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    View all{" "}
                    {classes.length}{" "}
                    classes
                  </button>
                )}

              </div>

            )}

          </div>

        </section>


        {/* ===================================================
            LIVE CLASSES
        =================================================== */}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-sm font-black text-white">
                  Live Classes
                </h2>

                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                  activeLiveClasses.length >
                  0
                    ? "border-red-400/20 bg-red-400/[0.08] text-red-300"
                    : "border-slate-400/10 bg-white/[0.025] text-slate-600"
                }`}>

                  <span className={`h-1.5 w-1.5 rounded-full ${
                    activeLiveClasses.length >
                    0
                      ? "bg-red-400 animate-pulse"
                      : "bg-slate-600"
                  }`} />

                  {activeLiveClasses.length >
                  0
                    ? "Live"
                    : "Offline"}

                </span>

              </div>

              <p className="mt-1 text-[10px] text-slate-600">
                Start and manage your live classroom
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  LIVE_CLASS_ROUTE
                )
              }
              className="text-[10px] font-bold text-cyan-400 transition hover:text-cyan-300"
            >
              Open Live Class
            </button>

          </div>


          <div className="p-5">

            {loading &&
            liveClasses.length ===
              0 ? (

              <LoadingState />

            ) : liveClassToShow ? (

              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-4">

                <div className="flex items-start justify-between gap-4">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      activeLiveClasses.length >
                      0
                        ? "bg-red-400/10 text-red-300"
                        : "bg-cyan-400/10 text-cyan-300"
                    }`}>

                      <Radio
                        size={18}
                      />

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-xs font-black text-white">
                        {firstDefined(
                          liveClassToShow,
                          [
                            "title",
                            "className",
                            "class_name",
                            "subject",
                          ],
                          "Live Class"
                        )}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {firstDefined(
                          liveClassToShow,
                          [
                            "grade",
                            "classGrade",
                            "class_grade",
                          ],
                          ""
                        )}

                        {firstDefined(
                          liveClassToShow,
                          [
                            "subject",
                          ],
                          ""
                        ) && (
                          <>
                            {" • "}
                            {firstDefined(
                              liveClassToShow,
                              [
                                "subject",
                              ],
                              ""
                            )}
                          </>
                        )}
                      </p>

                    </div>

                  </div>


                  <span className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-black uppercase ${
                    activeLiveClasses.length >
                    0
                      ? "bg-red-400/10 text-red-300"
                      : "bg-slate-400/10 text-slate-500"
                  }`}>
                    {activeLiveClasses.length >
                    0
                      ? "Live now"
                      : String(
                          firstDefined(
                            liveClassToShow,
                            [
                              "status",
                            ],
                            "Scheduled"
                          )
                        )}
                  </span>

                </div>


                <div className="mt-4 grid grid-cols-2 gap-2">

                  <div className="rounded-xl border border-white/10 bg-black/10 p-3">

                    <p className="text-[8px] font-black uppercase tracking-wider text-slate-700">
                      Room
                    </p>

                    <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
                      {firstDefined(
                        liveClassToShow,
                        [
                          "roomCode",
                          "room_code",
                        ],
                        "Not assigned"
                      )}
                    </p>

                  </div>


                  <div className="rounded-xl border border-white/10 bg-black/10 p-3">

                    <p className="text-[8px] font-black uppercase tracking-wider text-slate-700">
                      Students
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                      {toNumber(
                        firstDefined(
                          liveClassToShow,
                          [
                            "participantCount",
                            "participant_count",
                            "studentCount",
                            "student_count",
                          ],
                          0
                        )
                      )}
                    </p>

                  </div>

                </div>


                <button
                  onClick={() =>
                    navigate(
                      LIVE_CLASS_ROUTE
                    )
                  }
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400/10 px-3 py-2.5 text-[10px] font-black text-cyan-300 transition hover:bg-cyan-400/15"
                >

                  {activeLiveClasses.length >
                  0
                    ? "Open Live Class"
                    : "Manage Live Class"}

                  <ArrowRight
                    size={12}
                  />

                </button>

              </div>

            ) : (

              <EmptyState
                icon={Radio}
                title="No live class active"
                description="Open the live classroom when you're ready to start teaching your students online."
                actionLabel="Start Live Class"
                onAction={() =>
                  navigate(
                    LIVE_CLASS_ROUTE
                  )
                }
              />

            )}

          </div>

        </section>

      </div>


      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

          <div>

            <h2 className="text-sm font-black text-white">
              Recent Activity
            </h2>

            <p className="mt-1 text-[10px] text-slate-600">
              What's happening in your classes
            </p>

          </div>

          <div className="flex items-center gap-2">

            <span className="hidden text-[9px] font-bold text-slate-700 sm:inline">
              Auto checking every{" "}
              15s
            </span>

            <button
              className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white/5 hover:text-white"
              title="More"
            >

              <MoreHorizontal
                size={17}
              />

            </button>

          </div>

        </div>


        <div className="p-5">

          {loading &&
          recentActivity.length ===
            0 ? (

            <LoadingState />

          ) : recentActivity.length ===
            0 ? (

            <div className="flex flex-col items-center justify-center py-10 text-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">

                <TrendingUp
                  size={19}
                  className="text-slate-600"
                />

              </div>

              <h3 className="mt-4 text-xs font-black text-slate-300">
                No activity yet
              </h3>

              <p className="mt-1 max-w-sm text-[10px] leading-5 text-slate-600">
                Once you start creating tasks,
                teaching live classes and interacting
                with students, your activity will
                appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-2">

              {recentActivity.map(
                (
                  activity,
                  index
                ) => {

                  const date =
                    getActivityDate(
                      activity
                    );

                  return (
                    <motion.div
                      key={`${activity.id || index}-${date}`}
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index *
                          0.04,
                      }}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.015] p-3"
                    >

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-400/[0.04] text-cyan-300">

                        <ActivityIcon
                          activityType={
                            getActivityLabel(
                              activity
                            )
                          }
                        />

                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="truncate text-[11px] font-bold text-slate-300">
                            {firstDefined(
                              activity,
                              [
                                "title",
                                "name",
                              ],
                              "Academy activity"
                            )}
                          </p>

                          <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[7px] font-black uppercase tracking-wider text-slate-600">
                            {getActivityLabel(
                              activity
                            )}
                          </span>

                        </div>

                        <p className="mt-1 text-[9px] text-slate-700">

                          {formatDate(
                            date
                          )}

                          {formatTime(
                            date
                          ) && (
                            <>
                              {" • "}
                              {formatTime(
                                date
                              )}
                            </>
                          )}

                        </p>

                      </div>

                    </motion.div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          TEACHING TOOL STRIP
      ===================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-r from-cyan-400/[0.04] via-transparent to-violet-500/[0.04] p-5">

        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/[0.05] blur-[70px]" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10">

                <Sparkles
                  size={15}
                  className="text-cyan-300"
                />

              </div>

              <h2 className="text-sm font-black text-white">
                Your Teaching Workspace
              </h2>

            </div>

            <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500">
              Scholiqen brings your live classroom,
              presentation slides, PDFs, whiteboard,
              tasks, assignments and student progress
              together in one teaching environment.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <ToolButton
              icon={Radio}
              label="Live Class"
              onClick={() =>
                navigate(
                  LIVE_CLASS_ROUTE
                )
              }
            />

            <ToolButton
              icon={PenTool}
              label="Whiteboard"
              onClick={() =>
                navigate(
                  "/academy/tutor/whiteboard"
                )
              }
            />

            <ToolButton
              icon={FolderOpen}
              label="Materials"
              onClick={() =>
                navigate(
                  "/academy/tutor/materials"
                )
              }
            />

          </div>

        </div>

      </section>

    </div>
  );
};


/* ============================================================
   ACTIVITY ICON
============================================================ */

const ActivityIcon = ({
  activityType,
}) => {
  const type =
    String(
      activityType
    ).toLowerCase();

  if (
    type.includes(
      "live"
    )
  ) {
    return (
      <Radio
        size={15}
      />
    );
  }

  if (
    type.includes(
      "task"
    )
  ) {
    return (
      <ClipboardList
        size={15}
      />
    );
  }

  if (
    type.includes(
      "material"
    )
  ) {
    return (
      <FolderOpen
        size={15}
      />
    );
  }

  if (
    type.includes(
      "lesson"
    )
  ) {
    return (
      <GraduationCap
        size={15}
      />
    );
  }

  if (
    type.includes(
      "submission"
    )
  ) {
    return (
      <CheckCircle2
        size={15}
      />
    );
  }

  return (
    <TrendingUp
      size={15}
    />
  );
};


/* ============================================================
   LOADING STATE
============================================================ */

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04]">

        <Loader2
          size={19}
          className="animate-spin text-cyan-300"
        />

      </div>

      <h3 className="mt-4 text-xs font-black text-slate-300">
        Checking live data
      </h3>

      <p className="mt-1 max-w-sm text-[10px] leading-5 text-slate-600">
        Connecting to your Academy workspace and checking your latest teaching activity.
      </p>

    </div>
  );
};


/* ============================================================
   EMPTY STATE
============================================================ */

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">

        <Icon
          size={19}
          className="text-slate-600"
        />

      </div>

      <h3 className="mt-4 text-xs font-black text-slate-300">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-[10px] leading-5 text-slate-600">
        {description}
      </p>

      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] font-bold text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-300"
        >

          {actionLabel}

          <ArrowRight
            size={12}
          />

        </button>
      )}

    </div>
  );
};


/* ============================================================
   TOOL BUTTON
============================================================ */

const ToolButton = ({
  icon: Icon,
  label,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-[10px] font-bold text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-300"
    >

      <Icon
        size={14}
      />

      {label}

    </button>
  );
};

export default TutorDashboard;
