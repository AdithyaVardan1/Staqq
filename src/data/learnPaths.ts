export interface Lesson {
  title: string;
}

export interface Module {
  title: string;
  description: string; // ✅ NEW
  lessons: Lesson[];
}

export interface LearningPath {
  title: string;
  description: string;
  modules: Module[];
}

export const learnPaths: Record<string, LearningPath> = {
  beginner: {
    title: 'Absolute Beginner',
    description: 'Start from zero and understand how the stock market works.',
    modules: [
  {
    title: 'What is a Stock?',
    description: 'Understand companies, shares, and stock exchanges.',
    lessons: [
      { title: 'Companies and Shares' },
      { title: 'Stock Exchanges' },
    ],
  },
  {
    title: 'How to Start Investing',
    description: 'Learn how to open accounts and choose a broker.',
    lessons: [
      { title: 'Demat Account Basics' },
      { title: 'Choosing a Broker' },
    ],
  },
],

  },

  financials: {
    title: 'Understanding Financials',
    description: 'Learn how to read balance sheets and financial statements.',
    modules: [
      {
        title: 'Balance Sheet Basics',
        description: 'Understanding Numbers made easy',
        lessons: [
          { title: 'Assets & Liabilities' },
          { title: 'Equity Explained' },
        ],
      },
      {
        title: 'Profit & Loss Statement',
        description: 'How do you determine whether to invest in a company or not? Check this out',
        lessons: [
          { title: 'Revenue vs Profit' },
          { title: 'Margins & Expenses' },
        ],
      },
    ],
  },

  technical: {
    title: 'Technical Analysis',
    description: 'Learn charts, indicators, and price action.',
    modules: [
      {
        title: 'Charts & Timeframes',
        description: 'Understanding the timespans to invest',
        lessons: [
          { title: 'Types of Charts' },
          { title: 'Timeframes Explained' },
        ],
      },
      {
        title: 'Indicators',
        description: 'Quite like the name, it indicates to click on the indicated chapter, so do it',
        lessons: [
          { title: 'Moving Averages' },
          { title: 'RSI & MACD' },
        ],
      },
    ],
  },

  ipo: {
    title: 'Technical Analysis',
    description: 'Learn charts, indicators, and price action.',
    modules: [
      {
        title: 'Charts & Timeframes',
        description: 'Understanding the timespans to invest',
        lessons: [
          { title: 'Types of Charts' },
          { title: 'Timeframes Explained' },
        ],
      },
      {
        title: 'Indicators',
        description: 'Quite like the name, it indicates to click on the indicated chapter, so do it',
        lessons: [
          { title: 'Moving Averages' },
          { title: 'RSI & MACD' },
        ],
      },
    ],
  },
  
  fundamentals: {
    title: 'Technical Analysis',
    description: 'Learn charts, indicators, and price action.',
    modules: [
      {
        title: 'Charts & Timeframes',
        description: 'Understanding the timespans to invest',
        lessons: [
          { title: 'Types of Charts' },
          { title: 'Timeframes Explained' },
        ],
      },
      {
        title: 'Indicators',
        description: 'Quite like the name, it indicates to click on the indicated chapter, so do it',
        lessons: [
          { title: 'Moving Averages' },
          { title: 'RSI & MACD' },
        ],
      },
    ],
  },
};
