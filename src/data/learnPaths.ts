import { getModulesByPath } from "./modules";

function buildModulesForPath(pathKey: string) {
  return getModulesByPath(pathKey).map((m) => ({
    slug: m.slug,
    title: m.title,
    description: m.description,
    chapterCount: m.chapters.length,
    firstLesson: m.chapters[0] ? { slug: m.chapters[0].slug, title: m.chapters[0].title } : null,
  }));
}

export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface LearnPath {
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedTime: string;
  icon: string;
<<<<<<< HEAD
  color: string;
=======
>>>>>>> f48a43d (Pull learning hub UI fixes from fix/learning-hub-ui)
  modules: ReturnType<typeof buildModulesForPath>;
}

export const learnPaths: Record<string, LearnPath> = {
  beginner: {
    title: "Absolute Beginner",
    description: "Start from zero. Learn what stocks are and how markets work.",
    difficulty: "BEGINNER",
    estimatedTime: "45m",
    icon: "sprout",
<<<<<<< HEAD
    color: "#b6ff00",
=======
>>>>>>> f48a43d (Pull learning hub UI fixes from fix/learning-hub-ui)
    modules: buildModulesForPath("beginner"),
  },

  financials: {
    title: "Understanding Financials",
    description: "Read balance sheets, P&L statements, and key ratios.",
    difficulty: "INTERMEDIATE",
    estimatedTime: "1h 30m",
    icon: "chart-bar",
<<<<<<< HEAD
    color: "#38bdf8",
=======
>>>>>>> f48a43d (Pull learning hub UI fixes from fix/learning-hub-ui)
    modules: buildModulesForPath("financials"),
  },

  technical: {
    title: "Technical Analysis",
    description: "Charts, patterns, indicators, and price action.",
    difficulty: "INTERMEDIATE",
    estimatedTime: "2h 00m",
    icon: "chart-candlestick",
<<<<<<< HEAD
    color: "#f59e0b",
=======
>>>>>>> f48a43d (Pull learning hub UI fixes from fix/learning-hub-ui)
    modules: buildModulesForPath("technical"),
  },

  ipo: {
    title: "IPO Investing",
    description: "From RHP to listing day and long-term evaluation.",
    difficulty: "BEGINNER",
    estimatedTime: "1h 15m",
    icon: "rocket",
<<<<<<< HEAD
    color: "#a855f7",
=======
>>>>>>> f48a43d (Pull learning hub UI fixes from fix/learning-hub-ui)
    modules: buildModulesForPath("ipo"),
  },

  fundamental: {
    title: "Fundamental Analysis",
    description: "Deep-dive into business and long-term investing.",
    difficulty: "ADVANCED",
    estimatedTime: "2h 30m",
    icon: "building",
<<<<<<< HEAD
    color: "#ff6b35",
=======
>>>>>>> f48a43d (Pull learning hub UI fixes from fix/learning-hub-ui)
    modules: buildModulesForPath("fundamental"),
  },
};
