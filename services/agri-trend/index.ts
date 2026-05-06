export interface EvidenceArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

export interface HotCrop {
  name: string;
  trendScore: number;
  sentiment: "positive" | "negative" | "neutral";
  reason: string;
  evidence: EvidenceArticle[];
}

export interface MarketSignals {
  supplyPressure: string;
  demandSignals: string;
  priceAlerts: string[];
  evidence: EvidenceArticle[];
}

export interface TechSpotlightItem {
  title: string;
  summary: string;
  impact: string;
  evidence: EvidenceArticle[];
}

export interface AgriAlert {
  type: "disease" | "weather" | "price" | "policy";
  severity: "high" | "medium" | "low";
  message: string;
  evidence: EvidenceArticle[];
}

export interface AgriTrendResponse {
  generatedAt: string;
  cacheExpiresAt: string;
  totalArticlesAnalyzed: number;
  summary: string;
  hotCrops: HotCrop[];
  marketSignals: MarketSignals;
  techSpotlight: TechSpotlightItem[];
  alerts: AgriAlert[];
}
