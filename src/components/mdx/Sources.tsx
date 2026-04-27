import styles from "./Sources.module.css";

interface SourcesProps {
  path: "beginner" | "financials" | "fundamental" | "ipo" | "technical";
}

export default function Sources({ path }: SourcesProps) {
  const sourcesByPath = {
    beginner: [
      "SEBI Investor Education Guidelines (investor.sebi.gov.in)",
      "NSE Pathshala - Financial Literacy Program",
    ],
    financials: [
      "ICAI Financial Reporting Standards",
      "Companies Act 2013 - Financial Statement Formats",
    ],
    fundamental: [
      "CFA Institute - Equity Asset Valuation",
      "NCFM Fundamental Analysis Module",
    ],
    ipo: [
      "SEBI (Issue of Capital and Disclosure Requirements) Regulations, 2018",
      "SEBI Guidelines for Red Herring Prospectus (RHP) Format",
    ],
    technical: [
      "Standard Market Conventions for Technical Analysis",
      "BSE/NSE Charting and Analysis Guides",
    ],
  };

  const currentSources = sourcesByPath[path] || [];

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Sources & Disclaimer</h4>
      <ul className={styles.list}>
        {currentSources.map((source, index) => (
          <li key={index} className={styles.item}>
            {source}
          </li>
        ))}
      </ul>
      <p className={styles.disclaimer}>
        Note: Any benchmarks (e.g., "Good ROE is &gt; 20%", or specific P/E
        ranges) are simplified industry heuristics for educational purposes. True
        evaluation depends on specific industry context, market cycles, and
        individual company circumstances.
      </p>
    </div>
  );
}
