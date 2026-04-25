import React from 'react';

/**
 * Reusable component for injecting JSON-LD structured data into the <head>.
 */
export function StructuredData({ schema }: { schema: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Named schema generators for consistent usage

export function OrganizationStructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Staqq",
    "url": "https://staqqin.vercel.app",
    "logo": "https://staqqin.vercel.app/logo.png",
    "description": "Indian stock market intelligence platform for retail investors. Live IPO GMP, FII/DII data, and smart stock screeners.",
    "sameAs": [
      // Add social links here if available
      "https://twitter.com/staqq",
    ]
  };
  return <StructuredData schema={schema} />;
}

export function WebSiteStructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://staqqin.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://staqqin.vercel.app/stocks/screener?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  return <StructuredData schema={schema} />;
}

export function DatasetStructuredData({ 
  name, 
  description, 
  url, 
  dateModified 
}: { 
  name: string, 
  description: string, 
  url: string, 
  dateModified: string 
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": name,
    "description": description,
    "url": url,
    "creator": {
      "@type": "Organization",
      "name": "Staqq"
    },
    "temporalCoverage": "2024/2026",
    "spatialCoverage": "India",
    "dateModified": dateModified,
    "keywords": ["Indian Stock Market", "NSE", "BSE", "FII DII", "Insider Trades"]
  };
  return <StructuredData schema={schema} />;
}

export function BreadcrumbStructuredData({ items }: { items: { name: string, item: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  };
  return <StructuredData schema={schema} />;
}

export function ArticleStructuredData({ 
  headline, 
  description, 
  author, 
  datePublished, 
  dateModified, 
  url 
}: { 
  headline: string, 
  description: string, 
  author: string, 
  datePublished: string, 
  dateModified: string, 
  url: string 
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author
    },
    "datePublished": datePublished,
    "dateModified": dateModified,
    "publisher": {
      "@type": "Organization",
      "name": "Staqq",
      "logo": {
        "@type": "ImageObject",
        "url": "https://staqqin.vercel.app/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };
  return <StructuredData schema={schema} />;
}
