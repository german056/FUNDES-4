import * as fs from 'fs';
import XLSX from 'xlsx';

// Helper to sanitize text
function cleanText(v: any): string {
  if (v === null || v === undefined) return '';
  return String(v).trim().replace(/\s+/g, ' ');
}

// Map level (e.g. "I", "II", "III", "IV") or credits to difficulty
function mapLevel(val: string): "Principiante" | "Intermedio" | "Avanzado" {
  const norm = cleanText(val).toUpperCase();
  if (norm === 'I' || norm === 'II' || norm === '1' || norm === '2') return "Principiante";
  if (norm === 'III' || norm === 'IV' || norm === '3' || norm === '4') return "Intermedio";
  return "Avanzado";
}

// Generate realistic instructor details
const PROFESORES = [
  { name: "Mag. Liliana Escudero", role: "Decana de Educación FUNDES" },
  { name: "Dr. Humberto Sanabria", role: "Coordinador de Investigaciones FUNDES" },
  { name: "Dra. Paula Andrea Gómez", role: "Docente de Alta Especialización FUNDES" },
  { name: "Ing. Carlos Mario Duarte", role: "Líder de Tecnología e Innovación" },
  { name: "Mag. Clara Inés Vargas", role: "Catedrática Distinguida" },
  { name: "Dr. Luis Fernando Restrepo", role: "Asesor Curricular FUNDES" }
];

function getInstructor(index: number, manualInstructor?: string) {
  if (manualInstructor && manualInstructor.trim()) {
    return {
      name: cleanText(manualInstructor),
      role: "Docente Autoridad FUNDES",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
    };
  }
  const prof = PROFESORES[index % PROFESORES.length];
  return {
    ...prof,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
  };
}

// Select a relevant Unsplash image based on the course title
function getUnsplashImage(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('inglés') || t.includes('english') || t.includes('comunicativas') || t.includes('hablar')) {
    return "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80"; // English/languages
  }
  if (t.includes('digital') || t.includes('sistemas') || t.includes('tecnolog') || t.includes('tic') || t.includes('computa')) {
    return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"; // Digital / Tech
  }
  if (t.includes('matematic') || t.includes('cálculo') || t.includes('fisica') || t.includes('epistemolog') || t.includes('probabilidad') || t.includes('estadística') || t.includes('algebra')) {
    return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"; // Math / Calculus
  }
  if (t.includes('ambiental') || t.includes('ecolog') || t.includes('geología') || t.includes('rurales') || t.includes('clima') || t.includes('ambiente')) {
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"; // Ecological / Nature
  }
  if (t.includes('psico') || t.includes('psicolog') || t.includes('humano') || t.includes('afectivo') || t.includes('social')) {
    return "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80"; // Psychology / Social
  }
  if (t.includes('penal') || t.includes('derecho') || t.includes('procesal') || t.includes('constitu') || t.includes('legal') || t.includes('probatorio') || t.includes('audiencias')) {
    return "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"; // Law / Court
  }
  if (t.includes('marketing') || t.includes('mercadeo') || t.includes('negocio') || t.includes('comercio') || t.includes('financia') || t.includes('costos') || t.includes('presupuesto')) {
    return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"; // Business / Finance
  }
  if (t.includes('salud') || t.includes('médic') || t.includes('clínic') || t.includes('primeros auxilios') || t.includes('humanización')) {
    return "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=800&q=80"; // Health / Clinical
  }
  // Generic beautiful classroom / education banner
  return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80";
}

// Generate realistic modules and lessons for each course
function generateModulesAndLessons(courseId: string, courseTitle: string) {
  return [
    {
      id: `${courseId}-mod1`,
      title: "Módulo 1: Fundamentación Académica",
      description: `Introducción teórica, conceptos esenciales y contextualización histórica sobre ${courseTitle}.`,
      lessons: [
        { id: `${courseId}-l1`, title: `Introducción y Conceptos Básicos`, duration: "15 min", xp: 50 },
        { id: `${courseId}-l2`, title: `Marco Normativo e Histórico`, duration: "18 min", xp: 60 }
      ]
    },
    {
      id: `${courseId}-mod2`,
      title: "Módulo 2: Técnicas de Aplicación Práctica",
      description: `Implementación procedimental, resolución de casos problemáticos y dinamismo en ${courseTitle}.`,
      lessons: [
        { id: `${courseId}-l3`, title: `Metodología de Trabajo y Procesamientos`, duration: "25 min", xp: 80 },
        { id: `${courseId}-l4`, title: `Análisis de Casos y Talleres Prácticos`, duration: "22 min", xp: 75 }
      ]
    },
    {
      id: `${courseId}-mod3`,
      title: "Módulo 3: Evaluación y Certificación",
      description: `Consolidación de las destrezas teóricas y prácticas. Taller evaluativo final en ${courseTitle}.`,
      lessons: [
        { id: `${courseId}-l5`, title: `Prueba Escrita de Rendimiento Académico`, duration: "20 min", xp: 100 },
        { id: `${courseId}-l6`, title: `Sustentación de Proyecto Curricular`, duration: "30 min", xp: 120 }
      ]
    }
  ];
}

function processSpreadsheet() {
  const workbook = XLSX.readFile('/tmp/temp_sheet.xlsx');
  const allCourses: any[] = [];
  let globalIndex = 0;

  // 1. Process "Ingeniería Comercial (IngComerc"
  const ingSheetName = workbook.SheetNames.find(s => s.trim().startsWith("Ingeniería Comercial"));
  if (ingSheetName) {
    const sheet = workbook.Sheets[ingSheetName];
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    // Rows index 2 (row 3) onwards
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 5) continue;
      
      const code = cleanText(row[2]);
      const title = cleanText(row[3]);
      const levelCycle = cleanText(row[4] || row[1]); // Semester/Cycle
      const url = cleanText(row[5]);
      const credits = parseInt(row[6]) || 2;
      
      if (!title || !url.startsWith("http")) continue;
      
      const id = `ingc-${code || globalIndex}`;
      allCourses.push({
        id,
        title,
        description: `Asignatura oficial de Ingeniería Comercial para el Semestre ${levelCycle}. Potencia tus competencias empresariales con FUNDES.`,
        category: "Ingeniería Comercial",
        imageUrl: getUnsplashImage(title),
        durationHours: credits * 16,
        level: mapLevel(levelCycle),
        courseUrl: url,
        instructor: getInstructor(globalIndex),
        modules: generateModulesAndLessons(id, title)
      });
      globalIndex++;
    }
  }

  // 2. Process "Administración Ambiental (Admon"
  const adminSheetName = workbook.SheetNames.find(s => s.trim().startsWith("Administración Ambiental"));
  if (adminSheetName) {
    const sheet = workbook.Sheets[adminSheetName];
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 5) continue;
      
      const levelCycle = cleanText(row[0] || row[4]);
      const code = cleanText(row[2]);
      const title = cleanText(row[3]);
      const url = cleanText(row[5]);
      const credits = parseInt(row[6]) || 2;
      
      if (!title || !url.startsWith("http")) continue;
      
      const id = `adma-${code || globalIndex}`;
      allCourses.push({
        id,
        title,
        description: `Asignatura académica del programa de Administración Ambiental en Semestre ${levelCycle}. Enfoque ecológico sostenible de FUNDES.`,
        category: "Administración Ambiental",
        imageUrl: getUnsplashImage(title),
        durationHours: credits * 16,
        level: mapLevel(levelCycle),
        courseUrl: url,
        instructor: getInstructor(globalIndex),
        modules: generateModulesAndLessons(id, title)
      });
      globalIndex++;
    }
  }

  // 3. Process "ESP- VIRTUAL"
  const espVirtualName = workbook.SheetNames.find(s => s.trim() === "ESP- VIRTUAL");
  if (espVirtualName) {
    const sheet = workbook.Sheets[espVirtualName];
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    let currentProgram = "Especializaciones Virtuales";
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;
      
      if (cleanText(row[1])) {
        currentProgram = cleanText(row[1]);
      }
      
      // Left side asignatura
      const title1 = cleanText(row[2]);
      const url1 = cleanText(row[3]);
      if (title1 && url1.startsWith("http")) {
        const id = `espv-l-${globalIndex}`;
        allCourses.push({
          id,
          title: title1,
          description: `Módulo de alta formación para el programa de posgrado de la ${currentProgram} en FUNDES.`,
          category: "Especializaciones (Virtual)",
          imageUrl: getUnsplashImage(title1),
          durationHours: 32,
          level: "Avanzado" as const,
          courseUrl: url1,
          instructor: getInstructor(globalIndex),
          modules: generateModulesAndLessons(id, title1)
        });
        globalIndex++;
      }

      // Right side asignatura
      const title2 = cleanText(row[5]);
      const url2 = cleanText(row[6]);
      if (title2 && url2.startsWith("http")) {
        const id = `espv-r-${globalIndex}`;
        allCourses.push({
          id,
          title: title2,
          description: `Módulo de alta formación para el programa de posgrado de la ${currentProgram} en FUNDES.`,
          category: "Especializaciones (Virtual)",
          imageUrl: getUnsplashImage(title2),
          durationHours: 32,
          level: "Avanzado" as const,
          courseUrl: url2,
          instructor: getInstructor(globalIndex),
          modules: generateModulesAndLessons(id, title2)
        });
        globalIndex++;
      }
    }
  }

  // 4. Process "ESP- PRESENCIAL. "
  const espPresName = workbook.SheetNames.find(s => s.trim().startsWith("ESP- PRESENCIAL"));
  if (espPresName) {
    const sheet = workbook.Sheets[espPresName];
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    let currentProgram = "Especializaciones Presenciales";
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;
      
      if (cleanText(row[0])) {
        currentProgram = cleanText(row[0]);
      }
      
      const title = cleanText(row[2] || row[4]);
      let url = cleanText(row[3] || row[5] || row[6]);
      if (url.includes('#')) {
        url = url.split('#')[0];
      }
      
      if (title && url.startsWith("http")) {
        const id = `espp-${globalIndex}`;
        allCourses.push({
          id,
          title,
          description: `Asignatura oficial presencial perteneciente al posgrado: ${currentProgram} dictado en el campus de FUNDES.`,
          category: "Especializaciones (Presencial)",
          imageUrl: getUnsplashImage(title),
          durationHours: 32,
          level: "Avanzado" as const,
          courseUrl: url,
          instructor: getInstructor(globalIndex),
          modules: generateModulesAndLessons(id, title)
        });
        globalIndex++;
      }
    }
  }

  // 5. Process "CUROS DE EDUCACION CONTINUA "
  const contSheetName = workbook.SheetNames.find(s => s.trim().startsWith("CUROS DE EDUCACION CONTINUA") || s.trim().startsWith("CUROS DE EDUCACION"));
  if (contSheetName) {
    const sheet = workbook.Sheets[contSheetName];
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;
      
      let instructor = cleanText(row[0]);
      const title = cleanText(row[1]);
      const url = cleanText(row[2]);
      
      if (title && url.startsWith("http")) {
        const id = `educ-${globalIndex}`;
        allCourses.push({
          id,
          title,
          description: `Programa oficial desarrollado para la Unidad de Extensión y Educación Continua de FUNDES. Formación y actualización ágil para profesionales.`,
          category: "Educación Continua",
          imageUrl: getUnsplashImage(title),
          durationHours: 20,
          level: "Intermedio" as const,
          courseUrl: url,
          instructor: getInstructor(globalIndex, instructor),
          modules: generateModulesAndLessons(id, title)
        });
        globalIndex++;
      }
    }
  }

  console.log(`Successfully parsed ${allCourses.length} courses!`);

  // Define student profiles to write out alongside courses
  const studentProfilesString = `export const STUDENT_PROFILES: UserProfile[] = [
  {
    id: "sofia-rodriguez",
    name: "Sofía Rodríguez",
    role: "Diseñadora Gráfica",
    email: "sofia.rod@educacion.com",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    colorTheme: "rose",
    initialProgress: []
  },
  {
    id: "carlos-mendoza",
    name: "Carlos Mendoza",
    role: "Coordinador de Operaciones",
    email: "carlos.m@educacion.com",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    colorTheme: "amber",
    initialProgress: []
  },
  {
    id: "maria-jose",
    name: "María José Arias",
    role: "Desarrolladora Junior",
    email: "maria.arias@educacion.com",
    avatarUrl: "https://images.unsplash.com/photo-1541823709867-1b206113eafd?auto=format&fit=crop&w=150&h=150&q=80",
    colorTheme: "emerald",
    initialProgress: []
  },
  {
    id: "usuario-invitado",
    name: "Tú (Usuario Invitado)",
    role: "Estudiante Autodidacta",
    email: "germanbastos778@gmail.com",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    colorTheme: "indigo",
    initialProgress: []
  }
];`;

  // Write content to /src/data.ts
  const outputContent = `import { Course, UserProfile } from "./types";

export const COURSES: Course[] = ${JSON.stringify(allCourses, null, 2)};

${studentProfilesString}
`;

  fs.writeFileSync('src/data.ts', outputContent, 'utf-8');
  console.log("data.ts has been successfully generated & over-written!");
}

processSpreadsheet();
