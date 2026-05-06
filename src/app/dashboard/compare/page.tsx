import type { Metadata } from "next";
import { ProductComparisonPage } from "@/components/pages/ProductComparisonPage";

export const metadata: Metadata = { title: "Product Compare — YieldIntel" };
export default function ComparePage() { return <ProductComparisonPage />; }
