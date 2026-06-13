import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Circle, 
  Grid, 
  List, 
  Search, 
  Clock, 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Trophy, 
  RotateCcw, 
  User, 
  GraduationCap, 
  BookOpenCheck,
  Check,
  Briefcase,
  Layers,
  Sparkle,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Trash2,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { COURSES, STUDENT_PROFILES } from "./data";
import { Course, UserProfile } from "./types";
import { parseCSVToCourses } from "./utils/csvParser";

const getCourseSubProgram = (course: any) => {
  if (course.category !== "Especializaciones (Virtual)") return null;
  const desc = (course.description || "").toLowerCase();
  const title = (course.title || "").toLowerCase();
  const idValue = (course.id || "").toLowerCase();
  
  if (desc.includes("derecho")) {
    return {
      id: "derecho",
      name: "Derecho Procesal Penal",
      color: "bg-purple-100/70 text-purple-700 border-purple-200/50",
      icon: "⚖️"
    };
  }
  if (desc.includes("salud")) {
    return {
      id: "salud",
      name: "Gerencia de Empresas de Salud",
      color: "bg-sky-100/70 text-sky-700 border-sky-200/50",
      icon: "🏥"
    };
  }
  if (desc.includes("proyecto")) {
    return {
      id: "proyectos",
      name: "Gerencia de Proyectos",
      color: "bg-blue-100/70 text-blue-700 border-blue-200/50",
      icon: "📊"
    };
  }
  if (desc.includes("talento")) {
    return {
      id: "talento",
      name: "Gestión del Talento Humano",
      color: "bg-amber-100/70 text-amber-700 border-amber-200/50",
      icon: "👥"
    };
  }
  if (desc.includes("calidad") || desc.includes("sistemas de gestión") || desc.includes("sistemas gestión") || title.includes("calidad")) {
    return {
      id: "calidad",
      name: "Sistemas de Gestión Integrada",
      color: "bg-rose-100/70 text-rose-700 border-rose-200/50",
      icon: "⚙️"
    };
  }
  if (idValue.includes("-ia-") || desc.includes("inteligencia artificial") || title.includes("inteligencia") || desc.includes("machine learning") || desc.includes("ia generativa") || desc.includes("visualización de datos") || desc.includes("reporting")) {
    return {
      id: "ia",
      name: "Inteligencia Artificial",
      color: "bg-cyan-100/70 text-cyan-700 border-cyan-200/50",
      icon: "🤖"
    };
  }
  if (idValue.includes("-psi-") || desc.includes("psicología") || desc.includes("psicologia") || desc.includes("clima laboral") || desc.includes("estrés") || desc.includes("burnout") || desc.includes("liderazgo consciente") || desc.includes("emocional")) {
    return {
      id: "psicologia",
      name: "Psicología Org.",
      color: "bg-indigo-100/70 text-indigo-700 border-indigo-200/50",
      icon: "🧠"
    };
  }
  return null;
};

const subprogramsList = [
  { id: "derecho", label: "Derecho Procesal Penal", icon: "⚖️", desc: "Formación especializada en litigación penal, dogmática y el sistema acusatorio." },
  { id: "salud", label: "Gerencia de Empresas de Salud", icon: "🏥", desc: "Administración de IPS, calidad, auditoría médica y dirección estratégica en redes de salud." },
  { id: "proyectos", label: "Gerencia de Proyectos", icon: "📊", desc: "Análisis técnico de inversión, formulación, ejecución y metodologías ágiles." },
  { id: "talento", label: "Gestión del Talento Humano", icon: "👥", desc: "Dirección estratégica de personas, bienestar laboral, clima organizacional y liderazgo." },
  { id: "calidad", label: "Sistemas de Gestión Integrada", icon: "⚙️", desc: "Auditoría de sistemas integrados de calidad, medio ambiente y riesgos HSEQ (ISO 9001, 14001, 45001)." },
  { id: "ia", label: "Inteligencia Artificial", icon: "🤖", desc: "IA generativa en negocios, machine learning aplicado y analítica predictiva de datos." },
  { id: "psicologia", label: "Psicología Organizacional", icon: "🧠", desc: "Clima laboral saludable, pausas antiestrés, neurociencia del trabajo y gestión del cambio dinámico." }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Especializaciones (Virtual)": return "💻";
    case "Especializaciones (Presencial)": return "🏫";
    case "Ingeniería Comercial": return "💼";
    case "Administración Ambiental": return "🌱";
    case "Educación Continua": return "📚";
    default: return "🎓";
  }
};

export default function App() {
  // Courses catalog state with localStorage persistence
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("aula_courses_catalog");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= COURSES.length) {
          return parsed;
        }
      } catch (e) {
        console.error("Error loading courses from localStorage", e);
      }
    }
    // Set to new template default or reset if the saved length is smaller/outdated
    localStorage.setItem("aula_courses_catalog", JSON.stringify(COURSES));
    return COURSES;
  });

  // Active student profile ID
  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => {
    const saved = localStorage.getItem("aula_selected_profile_id");
    return saved && STUDENT_PROFILES.some(p => p.id === saved) ? saved : "usuario-invitado";
  });

  // Synchronizer tool state variables
  const [sheetUrl, setSheetUrl] = useState<string>("https://docs.google.com/spreadsheets/d/1L5jBs1ChPJ8NGbTE8OC1AbvKFZ_qMdYH/edit?usp=sharing&ouid=103793530132856733439&rtpof=true&sd=true");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<{ courses: number; modules: number; lessons: number } | null>(null);
  const [showSyncPanel, setShowSyncPanel] = useState<boolean>(true);

  const handleSheetSync = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsSyncing(true);
    setSyncError(null);
    setSyncStats(null);
    
    try {
      let csvUrl = sheetUrl.trim();
      
      if (csvUrl.includes("docs.google.com/spreadsheets")) {
        const matches = csvUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (matches && matches[1]) {
          csvUrl = `https://docs.google.com/spreadsheets/d/${matches[1]}/export?format=csv`;
        } else {
          throw new Error("Formato de URL de Google Sheets no reconocido. Asegúrate de incluir el ID de la hoja (/d/...)");
        }
      }
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Error de red al consultar la hoja: Server volvió estado ${response.status}`);
      }
      
      const csvText = await response.text();
      const parsed = parseCSVToCourses(csvText);
      setCourses(parsed);
      
      let totalModCount = 0;
      let totalLessonCount = 0;
      parsed.forEach(c => {
        totalModCount += c.modules.length;
        c.modules.forEach(m => {
          totalLessonCount += m.lessons.length;
        });
      });
      
      setSyncStats({
        courses: parsed.length,
        modules: totalModCount,
        lessons: totalLessonCount
      });
      
      showToast(`¡Sincronización completa! Se cargaron ${parsed.length} cursos desde Google Sheets 📊`);
    } catch (err: any) {
      console.error("Error synchronizing with Google Sheets:", err);
      setSyncError(
        "No se pudo sincronizar automáticamente por CORS o restricción del enlace. " +
        "Por favor asegúrate de que tu hoja esté pública: Archivo > Compartir > Compartir con otros > Cualquier usuario con el enlace puede ver."
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetCatalog = () => {
    if (confirm("¿Estás seguro de que deseas restablecer el catálogo de cursos virtual al diseño original de fábrica? Perderás cualquier curso importado o sincronizado.")) {
      setCourses(COURSES);
      setSyncStats(null);
      setSyncError(null);
      showToast("Se ha restablecido el catálogo predeterminado con éxito.");
    }
  };

  // User lesson completion map
  const [completedLessonsMap, setCompletedLessonsMap] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem("aula_completed_lessons_map");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading progress map", e);
      }
    }
    // Set initial seeded progress for all profiles
    const initialMap: Record<string, string[]> = {};
    STUDENT_PROFILES.forEach((profile) => {
      initialMap[profile.id] = [...profile.initialProgress];
    });
    return initialMap;
  });

  // Active filter category
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Active sub-program of Especializaciones (Virtual)
  const [activeSubProgram, setActiveSubProgram] = useState<string>("all");

  // Dropdown open states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubProgramOpen, setIsSubProgramOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const subProgramDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (subProgramDropdownRef.current && !subProgramDropdownRef.current.contains(event.target as Node)) {
        setIsSubProgramOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  // Unique category names (Academic Programs) across all current courses
  const allUniqueCategories = useMemo(() => {
    const setOfCats = new Set<string>();
    courses.forEach((course) => {
      if (course.category) {
        setOfCats.add(course.category.trim());
      }
    });
    return Array.from(setOfCats).sort();
  }, [courses]);

  // Layout mode: grid ("mosaico") or list ("lista")
  const [layoutMode, setLayoutMode] = useState<"mosaico" | "lista">("mosaico");

  // Search input query
  const [searchQuery, setSearchQuery] = useState("");

  // Detailed view of selected course
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Active certificate to display
  const [showCertificateCourseId, setShowCertificateCourseId] = useState<string | null>(null);

  // Status feedback notification state
  const [notification, setNotification] = useState<string | null>(null);

  // Persists the selections
  useEffect(() => {
    localStorage.setItem("aula_selected_profile_id", selectedProfileId);
  }, [selectedProfileId]);

  useEffect(() => {
    localStorage.setItem("aula_completed_lessons_map", JSON.stringify(completedLessonsMap));
  }, [completedLessonsMap]);

  useEffect(() => {
    localStorage.setItem("aula_courses_catalog", JSON.stringify(courses));
  }, [courses]);

  // Selected student details
  const activeStudent = useMemo(() => {
    return STUDENT_PROFILES.find((p) => p.id === selectedProfileId) || STUDENT_PROFILES[3];
  }, [selectedProfileId]);

  // Completed lessons of the active student
  const studentCompletedLessons = useMemo(() => {
    return completedLessonsMap[selectedProfileId] || [];
  }, [completedLessonsMap, selectedProfileId]);

  // Total XP calculation based on completed lessons
  const totalXP = useMemo(() => {
    let xp = 0;
    courses.forEach((course) => {
      course.modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          if (studentCompletedLessons.includes(lesson.id)) {
            xp += lesson.xp;
          }
        });
      });
    });
    return xp;
  }, [studentCompletedLessons, courses]);

  // Gamified student level name
  const studentLevel = useMemo(() => {
    if (totalXP >= 900) return { title: "Cerebro Supremo 👑", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (totalXP >= 500) return { title: "Erudito Digital 📖", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (totalXP >= 200) return { title: "Explorador Activo 🔭", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    return { title: "Novato Curioso 🚀", color: "text-slate-500 bg-slate-50 border-slate-200" };
  }, [totalXP]);

  // Trigger feedback notification helper
  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Helper function to calculate single course completion status
  const getCourseCompletion = (course: Course) => {
    let totalLessonsCount = 0;
    let completedLessonsCount = 0;

    course.modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        totalLessonsCount++;
        if (studentCompletedLessons.includes(lesson.id)) {
          completedLessonsCount++;
        }
      });
    });

    const percentage = totalLessonsCount > 0 
      ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
      : 0;

    return {
      completed: completedLessonsCount,
      total: totalLessonsCount,
      percentage,
      isFinished: percentage === 100
    };
  };

  // Individual courses with status attached
  const processedCourses = useMemo(() => {
    return courses.map((course) => {
      const stats = getCourseCompletion(course);
      return {
        ...course,
        stats
      };
    });
  }, [studentCompletedLessons, courses]);

  // Stats across all courses for active user
  const generalStats = useMemo(() => {
    let finished = 0;
    let inProgress = 0;
    let notStarted = 0;

    processedCourses.forEach((c) => {
      if (c.stats.percentage === 100) {
        finished++;
      } else if (c.stats.percentage > 0) {
        inProgress++;
      } else {
        notStarted++;
      }
    });

    return { finished, inProgress, notStarted };
  }, [processedCourses]);

  // Toggle lesson status
  const handleToggleLesson = (lessonId: string, lessonTitle: string) => {
    setCompletedLessonsMap((prev) => {
      const currentList = prev[selectedProfileId] || [];
      let nextList: string[];
      let isAdded = false;

      if (currentList.includes(lessonId)) {
        nextList = currentList.filter((id) => id !== lessonId);
      } else {
        nextList = [...currentList, lessonId];
        isAdded = true;
      }

      // Check if this newly checked lesson completes any course 100%
      // Find the course belonging to this lesson
      const course = courses.find(c => 
        c.modules.some(m => m.lessons.some(l => l.id === lessonId))
      );

      if (course && isAdded) {
        // Calculate completions with this updated list
        let completedWithNew = 0;
        let total = 0;
        course.modules.forEach(m => {
          m.lessons.forEach(l => {
            total++;
            if (l.id === lessonId || currentList.includes(l.id)) {
              completedWithNew++;
            }
          });
        });
        if (completedWithNew === total) {
          setTimeout(() => {
            setShowCertificateCourseId(course.id);
            showToast(`¡Felicitaciones! Has completado el curso "${course.title}" 🎉`);
          }, 450);
        }
      }

      showToast(isAdded ? `Lección completada: "${lessonTitle}" (+XP)` : `Lección desmarcada: "${lessonTitle}"`);

      return {
        ...prev,
        [selectedProfileId]: nextList
      };
    });
  };

  // Reset progress data for active user
  const handleResetProgress = () => {
    if (confirm(`¿Estás seguro de que deseas restablecer por completo tu progreso en esta cuenta?`)) {
      setCompletedLessonsMap((prev) => ({
        ...prev,
        [selectedProfileId]: []
      }));
      showToast("Se ha restablecido todo el progreso de este estudiante.");
    }
  };

  // Reset progress specifically for a single virtual specialization subprogram
  const handleResetSubprogramProgress = (subProgramId: string) => {
    const subProgName = {
      derecho: "Derecho Procesal",
      salud: "Gerencia de Salud",
      proyectos: "Gerencia de Proyectos",
      talento: "Talento Humano",
      calidad: "Sistemas Integrados",
      ia: "Inteligencia Artificial",
      psicologia: "Psicología Org."
    }[subProgramId] || subProgramId;

    if (confirm(`¿Estás seguro de que deseas restablecer el progreso únicamente para el programa de "${subProgName}"?`)) {
      const subprogramLessonsSet = new Set<string>();
      courses.forEach(c => {
        const sub = getCourseSubProgram(c);
        if (sub && sub.id === subProgramId) {
          c.modules.forEach(m => {
            m.lessons.forEach(l => {
              subprogramLessonsSet.add(l.id);
            });
          });
        }
      });

      setCompletedLessonsMap((prev) => {
        const currentList = prev[selectedProfileId] || [];
        const nextList = currentList.filter(lessonId => !subprogramLessonsSet.has(lessonId));
        return {
          ...prev,
          [selectedProfileId]: nextList
        };
      });

      showToast(`Se ha restablecido el progreso del programa "${subProgName}".`);
    }
  };

  // Filter and search logic
  const filteredCourses = useMemo(() => {
    return processedCourses.filter((course) => {
      // Category match
      const categoryMatch = activeCategory === "all" || course.category === activeCategory;

      // Sub-program match for Especializaciones (Virtual)
      let subProgramMatch = true;
      if (activeCategory === "Especializaciones (Virtual)" && activeSubProgram !== "all") {
        const sp = getCourseSubProgram(course);
        subProgramMatch = sp ? sp.id === activeSubProgram : false;
      }

      // Search match
      const lowerQuery = searchQuery.toLowerCase();
      const searchMatch = 
        course.title.toLowerCase().includes(lowerQuery) ||
        course.description.toLowerCase().includes(lowerQuery) ||
        course.modules.some(m => 
          m.title.toLowerCase().includes(lowerQuery) || 
          m.lessons.some(l => l.title.toLowerCase().includes(lowerQuery))
        );

      return categoryMatch && subProgramMatch && searchMatch;
    });
  }, [processedCourses, activeCategory, activeSubProgram, searchQuery]);

  // Grouped virtual specializations mapping
  const virtualGroups = useMemo(() => {
    if (activeCategory !== "Especializaciones (Virtual)") return [];
    
    return subprogramsList.map(prog => {
      const coursesInProg = filteredCourses.filter(c => {
        const sub = getCourseSubProgram(c);
        return sub && sub.id === prog.id;
      });
      
      const subProgTotalCourses = courses.filter(c => {
        if (c.category !== "Especializaciones (Virtual)") return false;
        const sub = getCourseSubProgram(c);
        return sub && sub.id === prog.id;
      });

      const totalSubCourses = subProgTotalCourses.length;
      const finishedSubCourses = subProgTotalCourses.filter(c => {
        const compl = getCourseCompletion(c);
        return compl.isFinished;
      }).length;

      const progressPercentage = totalSubCourses > 0 
        ? Math.round((finishedSubCourses / totalSubCourses) * 100) 
        : 0;

      return {
        ...prog,
        courses: coursesInProg,
        totalCount: totalSubCourses,
        finishedCount: finishedSubCourses,
        progress: progressPercentage
      };
    }).filter(group => {
      const matchesSubProgram = activeSubProgram === "all" || group.id === activeSubProgram;
      const hasMatchingCourses = group.courses.length > 0;
      return matchesSubProgram && hasMatchingCourses;
    });
  }, [filteredCourses, activeCategory, activeSubProgram, courses, completedLessonsMap, selectedProfileId]);

  // Course currently being studied in detail view
  const activeDetailCourse = useMemo(() => {
    if (!selectedCourseId) return null;
    return processedCourses.find((c) => c.id === selectedCourseId) || null;
  }, [processedCourses, selectedCourseId]);

  // Predefined student color styling
  const getThemeColors = (theme: string) => {
    switch (theme) {
      case "rose":
        return { bg: "bg-teal-600", text: "text-teal-600", border: "border-teal-200", focus: "focus:ring-teal-500", light: "bg-teal-50" };
      case "amber":
        return { bg: "bg-green-600", text: "text-green-600", border: "border-green-200", focus: "focus:ring-green-500", light: "bg-green-50" };
      case "emerald":
        return { bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-200", focus: "focus:ring-emerald-500", light: "bg-emerald-50" };
      case "indigo":
      default:
        return { bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-200", focus: "focus:ring-emerald-500", light: "bg-emerald-50" };
    }
  };

  const studentColors = getThemeColors(activeStudent.colorTheme);

  const renderCourseCard = (course: any) => {
    const isFinished = course.stats.isFinished;
    const inProgress = course.stats.percentage > 0 && !isFinished;
    const subProg = getCourseSubProgram(course);

    return (
      <motion.div
        layout
        key={course.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        onClick={() => setSelectedCourseId(course.id)}
        className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group hover:shadow-md cursor-pointer ${
          isFinished 
            ? "border-emerald-200 bg-emerald-50/5 ring-1 ring-emerald-500/10 hover:border-emerald-300" 
            : "border-slate-200/70 hover:border-slate-300"
        }`}
      >
        {/* Course Card Header Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          <img 
            src={course.imageUrl} 
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            referrerPolicy="no-referrer"
          />
          {course.category && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-slate-900/85 backdrop-blur-xs text-white rounded-md text-[8px] font-black tracking-wider uppercase shadow-sm z-10">
              {course.category}
            </span>
          )}
          {/* Study Badge Badge overlay */}
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
            <span className="px-3.5 py-1.5 bg-white/95 text-slate-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md">
              <span>📖</span> Estudiar Asignatura
            </span>
          </div>
        </div>

        {/* Card Content body */}
        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
          
          <div>
            {subProg && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider mb-2 shadow-3xs ${subProg.color}`}>
                <span>{subProg.icon}</span>
                <span>{subProg.name}</span>
              </div>
            )}
            <h4 className="text-sm font-black text-slate-800 group-hover:text-emerald-700 leading-snug tracking-tight transition-colors">
              {course.title}
            </h4>
            <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Learning Progress display */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-semibold flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{course.durationHours} hrs de teoría</span>
              </span>
              <span className={`font-black tracking-wide ${isFinished ? "text-emerald-600" : inProgress ? `${studentColors.text}` : "text-slate-400"}`}>
                {course.stats.percentage}%
              </span>
            </div>
            
            {/* Progress Bar Component */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${course.stats.percentage}%` }}
                transition={{ duration: 0.3 }}
                className={`h-full rounded-full transition-colors ${
                  isFinished ? "bg-emerald-500" : studentColors.bg
                }`}
              />
            </div>

            {/* Lessons completion numbers count indicator */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-semibold">
              <span>Progreso de lecciones:</span>
              <span className="font-bold text-slate-600">
                {course.stats.completed} de {course.stats.total} completadas
              </span>
            </div>
          </div>

        </div>

        {/* Card Actions Footer */}
        <div className="px-5 pb-5 pt-1 bg-slate-50/50 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <a
            href={course.courseUrl || "https://fundes.edu.co"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            title="Ir a la URL oficial de este curso"
          >
            <ExternalLink className="w-3.5 h-3.5 text-white/95" />
            <span>Enlace</span>
          </a>

          {/* Completed 100% Certificate trigger link */}
          {isFinished && (
            <button
              onClick={() => setShowCertificateCourseId(course.id)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center justify-center cursor-pointer"
              title="Ver diploma de acreditación obtenido"
            >
              <Trophy className="w-4 h-4" />
            </button>
          )}
        </div>

      </motion.div>
    );
  };

  const renderCourseRow = (course: any) => {
    const isFinished = course.stats.isFinished;
    const inProgress = course.stats.percentage > 0 && !isFinished;
    const subProg = getCourseSubProgram(course);

    return (
      <motion.div
        layout
        key={course.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        onClick={() => setSelectedCourseId(course.id)}
        className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col md:flex-row group cursor-pointer hover:border-slate-350 hover:shadow-xs ${
          isFinished 
            ? "border-emerald-200 bg-emerald-50/5 shadow-xs shadow-emerald-500/1" 
            : "border-slate-200/70"
        }`}
      >
        {/* Left horizontal thumbnail image */}
        <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 bg-slate-100">
          <img 
            src={course.imageUrl} 
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            referrerPolicy="no-referrer"
          />
          {course.category && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-slate-900/85 backdrop-blur-xs text-white rounded-md text-[8px] font-black tracking-wider uppercase shadow-sm z-10">
              {course.category}
            </span>
          )}
          {/* Study Badge Badge overlay */}
          <div className="absolute inset-0 bg-slate-900/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
            <span className="px-3.5 py-1.5 bg-white/95 text-slate-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md">
              <span>📖</span> Estudiar Asignatura
            </span>
          </div>
        </div>

        {/* Right central description box elements */}
        <div className="p-6 flex-1 flex flex-col justify-between gap-4">
          
          <div>
            {/* Content hours info */}
            <div className="flex items-center justify-between">
              {subProg ? (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider shadow-3xs ${subProg.color}`}>
                  <span>{subProg.icon}</span>
                  <span>{subProg.name}</span>
                </div>
              ) : <div />}
              <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                <span>{course.durationHours} hrs de contenido</span>
              </span>
            </div>

            {/* Title descriptions */}
            <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 mt-2.5 leading-snug transition-colors">
              {course.title}
            </h4>
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 md:line-clamp-1 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Course progress block */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between md:justify-start gap-3 md:w-32 shrink-0">
              <span className="text-xs font-bold text-slate-400">Progreso:</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                isFinished ? "bg-emerald-100 text-emerald-800" : `${studentColors.light} ${studentColors.text}`
              }`}>
                {course.stats.percentage}% {isFinished ? "Hecho" : ""}
              </span>
            </div>

            {/* Slider Progress bar container */}
            <div className="flex-1 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${course.stats.percentage}%` }}
                className={`h-full rounded-full ${
                  isFinished ? "bg-emerald-500" : studentColors.bg
                }`}
              />
            </div>

            <div className="text-2xs font-extrabold text-slate-400 text-right shrink-0">
              {course.stats.completed}/{course.stats.total} LECCIONES
            </div>
          </div>

          {/* Bottom row: actions buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-3 gap-3" onClick={(e) => e.stopPropagation()}>
            <div>
              <a
                href={course.courseUrl || "https://fundes.edu.co"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Ir a la URL oficial de este curso"
              >
                <ExternalLink className="w-3.5 h-3.5 text-white/95" />
                <span>Enlace del Curso</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              {/* Certificate preview button */}
              {isFinished && (
                <button
                  onClick={() => setShowCertificateCourseId(course.id)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
                >
                  <Trophy className="w-3.5 h-3.5 animate-bounce" />
                  <span>Diploma</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-950 pb-16">
      {/* Toast Notification feedback */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white font-medium text-sm px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-800/50"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Main Navigation Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-md shadow-emerald-600/10">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                Aula Virtual
              </h1>
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wide block leading-tight max-w-sm sm:max-w-md md:max-w-lg">
                Fundación de Estudios Superiores "Monseñor Abraham Escudero Montoya" FUNDES
              </span>
            </div>
          </div>

          {/* Compact Synchronization Button and inputs in the superior header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="Pegar Google Sheet URL..."
                className="w-full sm:w-64 md:w-80 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 placeholder-slate-400 bg-slate-50/50 focus:outline-hidden focus:border-emerald-500 font-mono"
                disabled={isSyncing}
                title="URL de Google Sheet compartida públicamente"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSheetSync()}
                disabled={isSyncing}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 h-8 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Sincronizando..." : "Sincronizar"}</span>
              </button>
              <button
                type="button"
                onClick={handleResetCatalog}
                disabled={isSyncing}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold border border-slate-200 h-8 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                title="Restablecer catálogo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Synchronizer Alert Banner for feedback errors or load stats */}
      <AnimatePresence>
        {(syncError || syncStats) && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 overflow-hidden"
          >
            {syncError && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start space-x-2 text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="text-xs">
                  <strong className="block font-bold">Error de importación:</strong>
                  <p className="mt-0.5 text-rose-700 font-medium leading-relaxed">{syncError}</p>
                </div>
                <button onClick={() => setSyncError(null)} className="ml-auto text-rose-400 hover:text-rose-600 text-xs">✕</button>
              </div>
            )}

            {syncStats && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <div className="text-xs font-semibold">
                    ¡Catálogo sincronizado con éxito desde Google Sheets!
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-[10px] font-black text-emerald-950 bg-white/70 px-2.5 py-1 rounded-md border border-emerald-100">
                  <span>{syncStats.courses} CURSOS</span>
                  <span>•</span>
                  <span>{syncStats.modules} MÓDULOS</span>
                  <span>•</span>
                  <span>{syncStats.lessons} LECCIONES</span>
                </div>
                <button onClick={() => setSyncStats(null)} className="ml-auto text-emerald-400 hover:text-emerald-600 text-xs sm:ml-2">✕</button>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main Catalog View Controller */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* Controls Layout Wrapper with Search and Filters */}
        <div className="flex flex-col gap-5 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs mb-8">
          
          {/* Main Controls Grid / Flex */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cursos, temas, módulos o profesores..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* General Categories Custom Dropdown */}
            <div className="relative shrink-0 md:w-64" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-sm text-slate-700 font-extrabold transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="text-emerald-600 flex shrink-0 items-center">
                    <Layers className="w-4 h-4" />
                  </span>
                  <span className="truncate">
                    {activeCategory === "all" 
                      ? "Todos los Posgrados" 
                      : activeCategory}
                  </span>
                </span>
                <span className="ml-1 text-slate-400 leading-none flex items-center shrink-0">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
                </span>
              </button>

              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute z-45 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/20 overflow-hidden divide-y divide-slate-100"
                  >
                    <div className="py-1 max-h-72 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCategory("all");
                          setActiveSubProgram("all");
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                          activeCategory === "all" ? "text-emerald-600 bg-emerald-50/40 font-extrabold" : "text-slate-600"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">🎓</span>
                          <span>Todos los Posgrados</span>
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-black">
                          {courses.length}
                        </span>
                      </button>
                      
                      {allUniqueCategories.map((cat) => {
                        const count = courses.filter((c) => c.category === cat).length;
                        const isSel = activeCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setActiveCategory(cat);
                              setActiveSubProgram("all");
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                              isSel ? "text-emerald-600 bg-emerald-50/40 font-extrabold" : "text-slate-600"
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className="text-base shrink-0">{getCategoryIcon(cat)}</span>
                              <span className="truncate">{cat}</span>
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-black shrink-0">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dropdown 2: Sub-program (Virtual Programs list dropdown menu) */}
            {activeCategory === "Especializaciones (Virtual)" && (
              <div className="relative shrink-0 md:w-72" ref={subProgramDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSubProgramOpen(!isSubProgramOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-sm text-slate-700 font-extrabold transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-emerald-600 flex shrink-0 items-center">
                      <GraduationCap className="w-4 h-4" />
                    </span>
                    <span className="truncate">
                      {activeSubProgram === "all" 
                        ? "Todas las Especializaciones" 
                        : (subprogramsList.find(p => p.id === activeSubProgram)?.label || activeSubProgram)}
                    </span>
                  </span>
                  <span className="ml-1 text-slate-400 leading-none flex items-center shrink-0">
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSubProgramOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>

                <AnimatePresence>
                  {isSubProgramOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.12 }}
                      className="absolute z-45 right-0 md:left-0 md:right-auto w-72 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/20 overflow-hidden divide-y divide-slate-100"
                    >
                      <div className="py-1 max-h-80 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSubProgram("all");
                            setIsSubProgramOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                            activeSubProgram === "all" ? "text-emerald-600 bg-emerald-50/40 font-extrabold" : "text-slate-600"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>🎓</span>
                            <span>Todas las Especializaciones</span>
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-black">
                            {courses.filter(c => c.category === "Especializaciones (Virtual)").length}
                          </span>
                        </button>
                        
                        {subprogramsList.map((prog) => {
                          const count = courses.filter(c => {
                            if (c.category !== "Especializaciones (Virtual)") return false;
                            const sub = getCourseSubProgram(c);
                            return sub && sub.id === prog.id;
                          }).length;
                          const isSel = activeSubProgram === prog.id;
                          
                          return (
                            <button
                              key={prog.id}
                              type="button"
                              onClick={() => {
                                setActiveSubProgram(prog.id);
                                setIsSubProgramOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                                isSel ? "text-emerald-600 bg-emerald-50/40 font-extrabold" : "text-slate-600"
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate">
                                <span className="text-base shrink-0">{prog.icon}</span>
                                <span className="truncate">{prog.label}</span>
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-black shrink-0">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Layout switch controls display */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/50 shrink-0 self-end md:self-auto">
              <button
                onClick={() => setLayoutMode("mosaico")}
                className={`px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center space-x-1.5 text-xs font-semibold cursor-pointer ${
                  layoutMode === "mosaico" 
                    ? "bg-white text-slate-900 shadow-3xs font-blackScale" 
                    : "text-slate-500 hover:text-slate-850"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Mosaico</span>
              </button>
              <button
                onClick={() => setLayoutMode("lista")}
                className={`px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center space-x-1.5 text-xs font-semibold cursor-pointer ${
                  layoutMode === "lista" 
                    ? "bg-white text-slate-900 shadow-3xs font-blackScale" 
                    : "text-slate-500 hover:text-slate-850"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
            </div>

          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-5 px-1 bg-white/50 py-2 rounded-xl border border-slate-100 px-3">
          <span className="font-extrabold text-slate-500">
            {activeCategory === "Especializaciones (Virtual)" 
              ? `Especializaciones Virtuales: ${virtualGroups.reduce((acc, curr) => acc + curr.courses.length, 0)} módulos estructurados`
              : `Mostrando ${filteredCourses.length} cursos en el catálogo`
            }
          </span>
          {activeCategory !== "all" || searchQuery || activeSubProgram !== "all" ? (
            <button 
              onClick={() => { 
                setActiveCategory("all"); 
                setActiveSubProgram("all");
                setSearchQuery(""); 
              }} 
              className="text-emerald-600 hover:underline cursor-pointer font-black text-xs flex items-center gap-1"
            >
              <span>♻️</span> Reiniciar filtros
            </button>
          ) : null}
        </div>

        {/* Courses Rendering Engine based on Layout Option: grid/list */}
        <AnimatePresence mode="popLayout">
          {filteredCourses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200/50 p-12 text-center w-full"
              key="empty-state"
            >
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-3xs">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">No se encontraron cursos</h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto font-medium">
                No hay coincidencias para tu búsqueda. Intenta modificando los criterios del menú desplegable o escribe algo diferente.
              </p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setActiveSubProgram("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Ver Todo el Catálogo
              </button>
            </motion.div>
          ) : activeCategory === "Especializaciones (Virtual)" ? (
            /* ORGANIZED DYNAMICALLY BY PROGRAM */
            <div className="space-y-10 w-full" key="organized-virtual-programs">
              {virtualGroups.map((group) => (
                <motion.section 
                  key={group.id} 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="bg-white/50 p-6 rounded-2xl border border-slate-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.015)] relative overflow-hidden"
                >
                  {/* Subtle top color bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-emerald-500`} />

                  {/* Header Plate for the Subprogram */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-100 mb-5">
                    <div className="flex-1 flex gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-xl border border-slate-200/50 shadow-3xs shrink-0 select-none">
                        {group.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-tight uppercase flex items-center gap-2">
                          {group.label}
                          <span className="text-[9.5px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200/40 px-2 py-0.5 rounded-full lowercase">
                            {group.courses.length} {group.courses.length === 1 ? 'módulo' : 'módulos'}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold max-w-2xl mt-1 leading-snug">
                          {group.desc}
                        </p>
                      </div>
                    </div>

                    {/* Right stats and reset program button */}
                    <div className="shrink-0 flex sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 w-full md:w-auto border-t md:border-0 border-slate-50 pt-3 md:pt-0">
                      <div className="text-left md:text-right flex-1 sm:flex-initial">
                        <div className="flex items-center md:justify-end gap-1.5 text-xs font-black text-slate-700 mb-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Estudiado:</span>
                          <span className="text-emerald-700">{group.progress}%</span>
                          <span className="text-[10px] text-slate-400 font-bold">({group.finishedCount}/{group.totalCount})</span>
                        </div>
                        <div className="w-40 bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${group.progress}%` }}
                          />
                        </div>
                      </div>

                      {group.progress > 0 && (
                        <button
                          onClick={() => handleResetSubprogramProgress(group.id)}
                          className="text-[10px] font-extrabold text-red-650 hover:text-red-700 bg-red-50 hover:bg-red-100/60 border border-red-200/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-3xs"
                          title="Restablecer progreso acumulado en este programa"
                        >
                          <span>🔄</span> Restablecer Progreso
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Courses Sub-catalog Rendered in layout Mode */}
                  {layoutMode === "mosaico" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.courses.map((course) => renderCourseCard(course))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {group.courses.map((course) => renderCourseRow(course))}
                    </div>
                  )}
                </motion.section>
              ))}
            </div>
          ) : (
            /* FLAT RENDERING FOR OTHER CATEGORIES */
            layoutMode === "mosaico" ? (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full" key="flat-mosaic">
                {filteredCourses.map((course) => renderCourseCard(course))}
              </motion.div>
            ) : (
              <motion.div layout className="flex flex-col gap-4 w-full" key="flat-list">
                {filteredCourses.map((course) => renderCourseRow(course))}
              </motion.div>
            )
          )}
        </AnimatePresence>

      </main>

      {/* DETAILED INTERACTIVE STUDY DRAWER (PANEL LATERAL) */}
      <AnimatePresence>
        {activeDetailCourse && (
          <>
            {/* Backdrop cover overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourseId(null)}
              className="fixed inset-0 bg-slate-900 z-50 pointer-events-auto"
            />

            {/* Inner lesson panel content */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg md:max-w-xl bg-white shadow-2xl z-50 flex flex-col justify-between"
            >
              
              {/* Drawer Title Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50 relative">
                <button
                  onClick={() => setSelectedCourseId(null)}
                  className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <span className="px-2.5 py-0.5 text-3xs font-extrabold uppercase tracking-widest rounded-md text-white bg-slate-800">
                  {activeDetailCourse.category}
                </span>

                {(() => {
                  const subProg = getCourseSubProgram(activeDetailCourse);
                  if (!subProg) return null;
                  return (
                    <span className={`px-2.5 py-0.5 text-3xs font-extrabold uppercase tracking-widest rounded-md border ml-2 ${subProg.color}`}>
                      {subProg.icon} {subProg.name}
                    </span>
                  );
                })()}

                <h3 className="text-base font-extrabold text-slate-900 mt-2 pr-6 leading-snug">
                  {activeDetailCourse.title}
                </h3>
                
                {/* Course Drawer statistics */}
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-semibold text-slate-500 bg-slate-200/50 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-slate-600">
                      {activeDetailCourse.durationHours} horas totales
                    </span>
                  </div>
                  <a
                    href={activeDetailCourse.courseUrl || "https://fundes.edu.co"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-2xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-emerald-100"
                    title="Visitar la URL de este curso"
                  >
                    <ExternalLink className="w-3 h-3 text-emerald-500" />
                    <span>Ir a URL del Curso</span>
                  </a>
                </div>
              </div>

              {/* Drawer scrollable content body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Motivation message if complete */}
                {activeDetailCourse.stats.isFinished && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start space-x-3.5">
                    <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg shrink-0">
                      <Trophy className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-emerald-800">¡Curso completado al 100%!</h5>
                      <p className="text-2xs text-emerald-600 mt-1 leading-relaxed">
                        Excelente trabajo {activeStudent.name}. Has obtenido un total de{" "}
                        <strong>
                          {activeDetailCourse.modules.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + l.xp, 0), 0)} XP
                        </strong>{" "}
                        fieles en tu historial. Puedes descargar tu diploma haciendo clic en el banner dorado.
                      </p>
                      
                      <button
                        onClick={() => {
                          setSelectedCourseId(null);
                          setShowCertificateCourseId(activeDetailCourse.id);
                        }}
                        className="text-2xs font-black text-amber-700 bg-amber-100 hover:bg-amber-200/80 px-2.5 py-1 rounded-sm mt-3 transition-all flex items-center space-x-1"
                      >
                        <span>Exhibir diploma acreditado 🎓</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Modules lists */}
                <div className="space-y-6">
                  {activeDetailCourse.modules.map((module, mIdx) => {
                    // Count completed in this specific module to show sub-module progress bar
                    const totalModLessons = module.lessons.length;
                    const completedModLessons = module.lessons.filter(l => studentCompletedLessons.includes(l.id)).length;
                    const modPercentage = totalModLessons > 0 ? Math.round((completedModLessons / totalModLessons) * 100) : 0;

                    return (
                      <div key={module.id} className="border border-slate-100 bg-slate-50/50 p-4.5 rounded-xl space-y-4">
                        
                        {/* Module header title */}
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-800/90 flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 text-2xs flex items-center justify-center font-black">
                                {mIdx + 1}
                              </span>
                              <span>{module.title}</span>
                            </h4>
                            <span className="text-2xs font-extrabold text-slate-400">
                              {completedModLessons}/{totalModLessons} COMPLETADO
                            </span>
                          </div>
                          
                          <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
                            {module.description}
                          </p>
                          
                          {/* Module tiny progress slider */}
                          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-3">
                            <div 
                              style={{ width: `${modPercentage}%` }}
                              className={`h-full rounded-full transition-all duration-300 ${
                                modPercentage === 100 ? "bg-emerald-500" : studentColors.bg
                              }`}
                            />
                          </div>
                        </div>

                        {/* Module lessons interactive check row items */}
                        <div className="space-y-2 pt-2.5 border-t border-slate-100">
                          {module.lessons.map((lesson) => {
                            const isCompleted = studentCompletedLessons.includes(lesson.id);
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleToggleLesson(lesson.id, lesson.title)}
                                className={`w-full text-left p-3 rounded-lg border transition-all text-xs font-medium flex items-center justify-between gap-3 group ${
                                  isCompleted
                                    ? "bg-emerald-50/70 border-emerald-100 hover:bg-emerald-100/60"
                                    : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-xs"
                                }`}
                              >
                                <div className="flex items-center space-x-3 pr-4">
                                  <div>
                                    {isCompleted ? (
                                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 text-transparent flex items-center justify-center group-hover:border-slate-400">
                                        •
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <span className={`text-slate-800 tracking-tight leading-snug line-clamp-2 ${isCompleted ? "line-through text-slate-400 font-normal" : "font-semibold"}`}>
                                      {lesson.title}
                                    </span>
                                    <div className="flex items-center space-x-3 text-2xs text-slate-400 mt-0.5">
                                      <span className="flex items-center space-x-0.5">
                                        <Clock className="w-2.5 h-2.5" />
                                        <span>{lesson.duration}</span>
                                      </span>
                                      <span>•</span>
                                      <span className="font-extrabold text-slate-500">+{lesson.xp} XP</span>
                                    </div>
                                  </div>
                                </div>

                                <span className={`text-3xs font-black uppercase px-2 py-0.5 rounded-sm ${
                                  isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                }`}>
                                  {isCompleted ? "Listo" : "Marcar"}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Drawer footer panel closing buttons */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest">
                  Total obtenible:{" "}
                  <span className="text-slate-700 font-bold">
                    {activeDetailCourse.modules.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + l.xp, 0), 0)} XP
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCourseId(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Regresar al listado
                </button>
              </div>

            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ELEGANT CERTIFICATE OF COMPLETION POPUP SCREEN */}
      <AnimatePresence>
        {showCertificateCourseId && (() => {
          const course = COURSES.find((c) => c.id === showCertificateCourseId);
          if (!course) return null;
          return (
            <>
              {/* Backdrop covering screen */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCertificateCourseId(null)}
                className="fixed inset-0 bg-slate-950/70 z-50 overflow-y-auto"
              />

              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
                {/* Interactive certification document */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 18 }}
                  className="bg-white border-8 border-double border-slate-100 outline outline-4 outline-amber-500/30 rounded-2xl max-w-2xl w-full p-8 md:p-12 relative shadow-2xl pointer-events-auto overflow-hidden bg-radial-gradient"
                >
                  
                  {/* Decorative background visual textures */}
                  <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute left-0 bottom-0 -translate-x-20 translate-y-20 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Close floating button */}
                  <button
                    onClick={() => setShowCertificateCourseId(null)}
                    className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100/50 hover:bg-slate-200/50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="text-center relative">
                    {/* Tiny visual ribbon icon and sparkles */}
                    <div className="inline-block relative mb-4">
                      <div className="bg-amber-100 text-amber-700 p-4 rounded-full mx-auto relative z-10 shadow-md">
                        <Trophy className="w-8 h-8 animate-pulse" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-400 fill-amber-300">
                        <Sparkles className="w-full h-full" />
                      </div>
                    </div>

                    <h2 className="text-amber-500 text-2xs uppercase tracking-widest font-black leading-none mb-1">
                      Constancia Oficial de Finalización
                    </h2>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mb-2">
                      AULA VIRTUAL PLATFORM
                    </h1>
                    
                    <hr className="border border-slate-200/60 max-w-[80px] mx-auto my-4" />

                    <p className="text-slate-500 text-xs italic tracking-wide mt-2">
                      Se otorga orgullosamente el presente certificado de excelencia académica a:
                    </p>
                    
                    {/* User name large title */}
                    <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-700 tracking-tight my-4 font-sans uppercase">
                      {activeStudent.name}
                    </h3>

                    <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                      Por haber completado con excelente rendimiento el trayecto teórico y práctico del curso virtual de:
                    </p>
                    
                    {/* Course complete title */}
                    <h4 className="text-base md:text-lg font-black text-slate-800 tracking-tight my-3.5 bg-slate-50 py-3 px-4 rounded-xl border border-slate-100">
                      {course.title}
                    </h4>

                    {/* Meta info block */}
                    <div className="grid grid-cols-3 gap-3 border-t border-slate-200/60 pt-5 mt-6 text-left">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">INTENSIDAD</span>
                        <span className="text-xs font-bold text-slate-600">{course.durationHours} Horas Lectivas</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">IDENTIFICADOR</span>
                        <span className="text-xs font-mono font-bold text-slate-600 text-2xs">AV-{course.id.slice(0, 5).toUpperCase()}-2026</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">ACREDITACIÓN</span>
                        <span className="text-xs font-bold text-slate-600">Aprobado 100%</span>
                      </div>
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between items-end mt-10 max-w-md mx-auto pt-4 border-t border-slate-100">
                      <div className="text-center">
                        <div className="font-serif italic text-slate-600 text-xs tracking-wider leading-none flex items-center justify-center space-x-1">
                          <span>DIRECCIÓN ACADÉMICA</span>
                        </div>
                        <div className="w-24 border-t border-slate-300 mt-1.5 mx-auto" />
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold mt-0.5 block">Dirección Evaluadora</span>
                      </div>
                      <div className="text-center">
                        <div className="font-mono text-[9px] text-emerald-600 font-black tracking-widest uppercase border border-emerald-200 px-2 py-0.5 rounded-sm">
                          Sello Digital
                        </div>
                        <div className="w-24 border-t border-slate-300 mt-1 mx-auto" />
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold mt-0.5 block">Aula Virtual S.A.</span>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-3">
                      <button
                        onClick={() => window.print()}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-2xs font-extrabold px-4  py-2 rounded-lg gap-1.5 transition-colors pointer-all"
                      >
                        Imprimir / Guardar PDF
                      </button>
                      <button
                        onClick={() => setShowCertificateCourseId(null)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-2xs font-extrabold px-4 py-2 rounded-lg transition-colors"
                      >
                        Cerrar vista
                      </button>
                    </div>

                  </div>
                </motion.div>
              </div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Footer Branding credits block */}
      <footer className="mt-20 border-t border-slate-200/60 pt-8 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-xs">
        <p className="font-bold text-slate-700 tracking-wide text-xs sm:text-sm mb-1.5 uppercase">
          Fundación de Estudios Superiores "Monseñor Abraham Escudero Montoya" FUNDES
        </p>
        <p>© 2026 Aula Virtual. Todos los derechos reservados.</p>
        <p className="text-2xs text-slate-400 mt-1">Desarrollado con React, Tailwind CSS y Framer Motion.</p>
      </footer>
    </div>
  );
}
