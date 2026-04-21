import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { z } from "zod";

const sourceCatalogSchema = z.object({
  authoritative_source_ids: z.array(z.string()),
  sources: z.array(
    z.object({
      id: z.string(),
      authority: z.string(),
      title: z.string(),
      region: z.string(),
      doc_type: z.string(),
      local_path: z.union([z.string(), z.null()]),
      remote_url: z.union([z.url(), z.null()]),
      published_at: z.union([z.string(), z.null()]).optional(),
      last_checked_at: z.union([z.string(), z.null()]).optional(),
      usage: z.string(),
      notes: z.string(),
    }),
  ),
});

export type SourceCatalog = z.infer<typeof sourceCatalogSchema>;
export type SourceRecord = SourceCatalog["sources"][number];

let cachedCatalog: SourceCatalog | null = null;

export function getSourceCatalog(): SourceCatalog {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const filePath = join(process.cwd(), "data", "catalog", "source_catalog.yaml");
  const raw = readFileSync(filePath, "utf8");
  cachedCatalog = sourceCatalogSchema.parse(parse(raw));
  return cachedCatalog;
}

export function getAuthoritativeSources() {
  const catalog = getSourceCatalog();
  const authoritativeIds = new Set(catalog.authoritative_source_ids);
  return catalog.sources.filter((source) => authoritativeIds.has(source.id));
}

export function getAuthoritativeSourceMap() {
  return new Map(getAuthoritativeSources().map((source) => [source.id, source]));
}
