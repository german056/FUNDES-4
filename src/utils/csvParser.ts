import { Course } from "../types";

/**
 * Safe parser for CSV lines handling quotes, commas, and semicolons
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  // Clean up quotes and escape characters
  return result.map(val => 
    val.replace(/^"|"$/g, '') // remove surrounding quotes
       .replace(/""/g, '"')    // unescape double quotes
  );
}

/**
 * Intelligent header mapper to match sheet columns to our schema
 */
export function solveHeaders(headers: string[]): Record<string, number> {
  const indexMap: Record<string, number> = {};
  
  const findIndex = (keywords: string[]) => {
    return headers.findIndex(h => {
      const normalized = h.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
      return keywords.some(keyword => normalized.includes(keyword));
    });
  };

  indexMap["courseTitle"] = findIndex(["curso", "course", "titulo", "title", "nombre", "capacitac", "materia"]);
  indexMap["courseDesc"] = findIndex(["descrip", "detalle", "info", "resumen"]);
  indexMap["category"] = findIndex(["categ", "tema", "area", "campo", "departamento", "especialidad"]);
  indexMap["imageUrl"] = findIndex(["imag", "img", "foto", "pantall", "banner", "portada", "image_url"]);
  indexMap["courseUrl"] = findIndex(["enlace", "link", "web", "sitio", "pestaña", "enlace_curso", "course_url"]);
  if (indexMap["courseUrl"] === -1) {
    indexMap["courseUrl"] = headers.findIndex(h => {
      const normalized = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return normalized === "url" || (normalized.includes("url") && !normalized.includes("img") && !normalized.includes("imag"));
    });
  }
  indexMap["durationHours"] = findIndex(["horas", "duracion", "duration", "hours", "tiempo_total"]);
  indexMap["level"] = findIndex(["nivel", "level", "grado", "dificul"]);
  indexMap["instructorName"] = findIndex(["instructor", "profesor", "docente", "autor", "maestro", "ponente"]);
  indexMap["moduleTitle"] = findIndex(["modulo", "module", "fase", "seccion", "unidad", "capitulo"]);
  indexMap["moduleDesc"] = findIndex(["descrip_mod", "descripcion modulo", "descripcion del modulo", "info modulo"]);
  indexMap["lessonTitle"] = findIndex(["leccion", "lesson", "tema", "clase", "contenido", "nombre leccion", "titulo leccion"]);
  indexMap["lessonDuration"] = findIndex(["duracion leccion", "duracion_lecc", "tiempo", "minutos", "mins", "lesson_duration"]);
  indexMap["lessonXP"] = findIndex(["xp", "puntos", "points", "valor", "experiencia", "puntuacion"]);

  // Resilient Fallbacks
  if (indexMap["courseTitle"] === -1) indexMap["courseTitle"] = 0;
  if (indexMap["moduleTitle"] === -1) indexMap["moduleTitle"] = Math.min(headers.length - 1, 1);
  if (indexMap["lessonTitle"] === -1) indexMap["lessonTitle"] = Math.min(headers.length - 1, 2);

  return indexMap;
}

/**
 * Primary CSV text parsing and conversion pipeline
 */
export function parseCSVToCourses(csvText: string): Course[] {
  if (!csvText || !csvText.trim()) {
    throw new Error("El archivo CSV está vacío.");
  }

  // Split lines and clean empty rows
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) {
    throw new Error("El archivo CSV debe tener al menos una columna de cabecera y una fila de datos.");
  }

  // Parse headers
  const headers = parseCSVLine(lines[0]);
  const indexMap = solveHeaders(headers);

  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 2) continue;

    const getValue = (key: string, fallback: any) => {
      const idx = indexMap[key];
      if (idx === undefined || idx === -1 || idx >= cols.length) return fallback;
      return cols[idx] !== "" ? cols[idx] : fallback;
    };

    // Extract values with smart format corrections
    const courseTitle = getValue("courseTitle", "Curso sin título");
    const courseDesc = getValue("courseDesc", "Explora y aprende los fundamentos clave de esta área educativa.");
    
    // Normalize category to our enum: "tecnologia" | "diseno" | "negocios" | "crecimiento"
    const categoryRaw = getValue("category", "tecnologia").toLowerCase();
    let category: "tecnologia" | "diseno" | "negocios" | "crecimiento" = "tecnologia";
    if (categoryRaw.includes("dis") || categoryRaw.includes("ux") || categoryRaw.includes("ui") || categoryRaw.includes("art") || categoryRaw.includes("creativ")) {
      category = "diseno";
    } else if (categoryRaw.includes("neg") || categoryRaw.includes("fin") || categoryRaw.includes("mkt") || categoryRaw.includes("vent") || categoryRaw.includes("adm")) {
      category = "negocios";
    } else if (categoryRaw.includes("scrum") || categoryRaw.includes("prd") || categoryRaw.includes("crec") || categoryRaw.includes("prod") || categoryRaw.includes("agil") || categoryRaw.includes("agile")) {
      category = "crecimiento";
    }

    const imageUrl = getValue("imageUrl", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80");
    const courseUrl = getValue("courseUrl", "");
    const durationHours = parseInt(getValue("durationHours", "12").replace(/[^0-9]/g, "")) || 12;
    
    const levelRaw = getValue("level", "Principiante");
    let level: "Principiante" | "Intermedio" | "Avanzado" = "Principiante";
    if (levelRaw.toLowerCase().includes("int") || levelRaw.toLowerCase().includes("med")) level = "Intermedio";
    if (levelRaw.toLowerCase().includes("av") || levelRaw.toLowerCase().includes("exp") || levelRaw.toLowerCase().includes("diff")) level = "Avanzado";

    const instructorName = getValue("instructorName", "Instructor Aula");
    const moduleTitle = getValue("moduleTitle", "Módulo 1: Fundamentos esenciales");
    const moduleDesc = getValue("moduleDesc", "Conceptos básicos y actividades prácticas de la unidad.");
    const lessonTitle = getValue("lessonTitle", "Lección de Introducción");
    const lessonDuration = getValue("lessonDuration", "15 min");
    const lessonXP = parseInt(getValue("lessonXP", "50").replace(/[^0-9]/g, "")) || 50;

    rows.push({
      courseTitle,
      courseDesc,
      category,
      imageUrl,
      durationHours,
      level,
      courseUrl,
      instructorName,
      moduleTitle,
      moduleDesc,
      lessonTitle,
      lessonDuration,
      lessonXP
    });
  }

  // Group by Course and Module
  const coursesMap: Record<string, Course> = {};

  rows.forEach((row, idx) => {
    const courseId = row.courseTitle.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
      
    if (!coursesMap[courseId]) {
      coursesMap[courseId] = {
        id: courseId,
        title: row.courseTitle,
        description: row.courseDesc,
        category: row.category,
        imageUrl: row.imageUrl,
        durationHours: row.durationHours,
        level: row.level,
        courseUrl: row.courseUrl,
        instructor: {
          name: row.instructorName,
          role: "Experto Universitario",
          avatarUrl: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80`
        },
        modules: []
      };
    }

    const course = coursesMap[courseId];
    
    // Find or create module inside Course
    const moduleId = `${courseId}-m-${row.moduleTitle.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")}`;
      
    let module = course.modules.find(m => m.id === moduleId);
    if (!module) {
      module = {
        id: moduleId,
        title: row.moduleTitle,
        description: row.moduleDesc,
        lessons: []
      };
      course.modules.push(module);
    }

    // Add lesson to module
    const lessonId = `${moduleId}-l-${idx}`;
    let durStr = row.lessonDuration.toString().trim();
    if (!durStr.toLowerCase().includes("min")) {
      durStr = `${durStr} min`;
    }

    module.lessons.push({
      id: lessonId,
      title: row.lessonTitle,
      duration: durStr,
      xp: row.lessonXP
    });
  });

  return Object.values(coursesMap);
}
