import React from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://staqq.in';

export function StructuredData({ schema }: { schema: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: { name: string; item: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.item,
    })),
  };
  return <StructuredData schema={schema} />;
}

// FAQPage schema -- highest single impact for AI Overview citations (41% citation rate vs 15% without)
export function FAQStructuredData({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
  return <StructuredData schema={schema} />;
}

// Dataset schema -- signals to Google + AI systems that this page contains citable structured data
export function DatasetStructuredData({
  name,
  description,
  url,
  dateModified,
  keywords,
}: {
  name: string;
  description: string;
  url: string;
  dateModified: string;
  keywords?: string[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": name,
    "description": description,
    "url": url,
    "creator": { "@id": `${BASE_URL}/#organization` },
    "publisher": { "@id": `${BASE_URL}/#organization` },
    "spatialCoverage": "India",
    "temporalCoverage": `2024/${new Date().getFullYear()}`,
    "dateModified": dateModified,
    "inLanguage": "en-IN",
    "license": "https://creativecommons.org/licenses/by-nc/4.0/",
    "keywords": keywords ?? ["Indian Stock Market", "NSE", "BSE", "FII", "DII"],
  };
  return <StructuredData schema={schema} />;
}

export function ArticleStructuredData({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  url,
}: {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author,
    },
    "publisher": { "@id": `${BASE_URL}/#organization` },
    "datePublished": datePublished,
    "dateModified": dateModified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url,
    },
  };
  return <StructuredData schema={schema} />;
}
