export interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g., "15 min", "20 min"
  xp: number; // Experience points rewarded
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  durationHours: number;
  level: "Principiante" | "Intermedio" | "Avanzado";
  courseUrl?: string;
  instructor: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  modules: Module[];
}

export interface UserProgress {
  userId: string;
  completedLessons: string[]; // List of completed lesson IDs
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl: string;
  colorTheme: string; // Tailwind tint for student profile accents
  initialProgress: string[]; // List of initial complete lesson IDs (for seeding)
}
