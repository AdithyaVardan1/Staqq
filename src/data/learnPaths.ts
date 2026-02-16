import { getModulesByPath } from "./modules";

function buildModulesForPath(pathKey: string) {
  return getModulesByPath(pathKey).map((m) => ({
    slug: m.slug,
    title: m.title,
    description: m.description,
    chapterCount: m.chapters.length,
  }));
}

export const learnPaths = {
  beginner: {
    title: "Absolute Beginner",
    description: "Start from zero. Learn what stocks are and how markets work.",
    modules: buildModulesForPath("beginner"),
    difficulty: "Beginner",
    duration: "45m",
    color: "from-green-400 to-emerald-600",
    icon: "Sprout"
  },

  financials: {
    title: "Understanding Financials",
    description: "Read balance sheets, P&L statements, and key ratios.",
    modules: buildModulesForPath("financials"),
    difficulty: "Intermediate",
    duration: "1h 30m",
    color: "from-blue-400 to-indigo-600",
    icon: "BarChart3"
  },

  technical: {
    title: "Technical Analysis",
    description: "Charts, patterns, indicators, and price action.",
    modules: buildModulesForPath("technical"),
    difficulty: "Intermediate",
    duration: "2h 00m",
    color: "from-purple-400 to-pink-600",
    icon: "CandlestickChart"
  },

  ipo: {
    title: "IPO Investing",
    description: "From RHP to listing day and long-term evaluation.",
    modules: buildModulesForPath("ipo"),
    difficulty: "Beginner",
    duration: "1h 15m",
    color: "from-orange-400 to-red-600",
    icon: "Rocket"
  },

  fundamental: {
    title: "Fundamental Analysis",
    description: "Deep-dive into business and long-term investing.",
    modules: buildModulesForPath("fundamental"),
    difficulty: "Advanced",
    duration: "2h 30m",
    color: "from-teal-400 to-cyan-600",
    icon: "Building2"
  },
};

