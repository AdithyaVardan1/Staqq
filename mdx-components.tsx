import type { MDXComponents } from "mdx/types";
import { Quiz } from "@/components/mdx/Quiz";
import { CodePlayground } from "@/components/mdx/CodePlayground";
import { InfoBox } from "@/components/mdx/InfoBox";
import { ChartExample } from "@/components/mdx/ChartExample";
import { Table } from "@/components/mdx/Table";

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        // Custom components available in all MDX files
        Quiz,
        CodePlayground,
        InfoBox,
        ChartExample,
        Table,
        // Spread default components
        ...components,
    };
}

