import { loadEnvConfig } from "@next/env";
import { createReadStream, existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import OpenAI, { toFile } from "openai";
import { getSourceCatalog, type SourceRecord } from "../src/lib/source-catalog";

loadEnvConfig(process.cwd());

type CliOptions = {
  dryRun: boolean;
  reindex: boolean;
  sourceId?: string;
  vectorStoreId?: string;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    reindex: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--reindex") {
      options.reindex = true;
      continue;
    }

    if (arg === "--source-id") {
      options.sourceId = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--vector-store-id") {
      options.vectorStoreId = argv[index + 1];
      index += 1;
    }
  }

  return options;
}

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required.");
  }

  return new OpenAI({ apiKey });
}

function getVectorStoreId(cliVectorStoreId?: string) {
  return cliVectorStoreId ?? process.env.OPENAI_VECTOR_STORE_ID ?? "";
}

function sourceAttributes(source: SourceRecord) {
  return {
    source_id: source.id,
    authority: source.authority,
    region: source.region,
    doc_type: source.doc_type,
  };
}

type ExistingVectorStoreFile = {
  id: string;
  status: string;
  last_error: string | null;
};

function getSourceIdAttribute(
  attributes?: Record<string, string | number | boolean> | null,
) {
  const sourceId = attributes?.source_id;
  return typeof sourceId === "string" && sourceId.length > 0 ? sourceId : null;
}

async function listExistingVectorStoreFiles(client: OpenAI, vectorStoreId: string) {
  const existingFilesBySource = new Map<string, ExistingVectorStoreFile[]>();

  for await (const file of client.vectorStores.files.list(vectorStoreId, {
    limit: 100,
    order: "desc",
  })) {
    const sourceId = getSourceIdAttribute(file.attributes);

    if (!sourceId) {
      continue;
    }

    const existingFiles = existingFilesBySource.get(sourceId) ?? [];
    existingFiles.push({
      id: file.id,
      status: file.status,
      last_error: file.last_error?.message ?? null,
    });
    existingFilesBySource.set(sourceId, existingFiles);
  }

  return existingFilesBySource;
}

function hasReusableExistingFile(existingFiles: ExistingVectorStoreFile[]) {
  return existingFiles.some((file) => {
    return file.status === "completed" || file.status === "in_progress";
  });
}

async function deleteExistingVectorStoreFiles(
  client: OpenAI,
  vectorStoreId: string,
  existingFiles: ExistingVectorStoreFile[],
) {
  for (const file of existingFiles) {
    await client.vectorStores.files.delete(file.id, {
      vector_store_id: vectorStoreId,
    });
  }
}

async function convertWebpageToTextFile(source: SourceRecord) {
  if (!source.remote_url) {
    throw new Error(`Source ${source.id} does not have a remote_url.`);
  }

  const response = await fetch(source.remote_url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.remote_url}: ${response.status}`);
  }

  const html = await response.text();
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  const tempDir = await mkdtemp(join(tmpdir(), "eco-guide-"));
  const tempPath = join(tempDir, `${source.id}.txt`);
  const content = `Title: ${source.title}
Authority: ${source.authority}
Source ID: ${source.id}
Source URL: ${source.remote_url}

${stripped}
`;

  await writeFile(tempPath, content, "utf8");

  return {
    path: tempPath,
    cleanup: async () => rm(tempDir, { force: true, recursive: true }),
  };
}

async function resolveUploadableFile(source: SourceRecord) {
  if (source.local_path) {
    const fullPath = resolve(process.cwd(), source.local_path);

    if (!existsSync(fullPath)) {
      throw new Error(`Local path does not exist: ${source.local_path}`);
    }

    return {
      file: createReadStream(fullPath),
      fileName: basename(fullPath),
      cleanup: async () => {},
    };
  }

  const webpageFile = await convertWebpageToTextFile(source);

  return {
    file: await toFile(await readFile(webpageFile.path), basename(webpageFile.path)),
    fileName: basename(webpageFile.path),
    cleanup: webpageFile.cleanup,
  };
}

async function uploadSource(
  client: OpenAI,
  vectorStoreId: string,
  source: SourceRecord,
) {
  const resolvedFile = await resolveUploadableFile(source);

  try {
    const fileRecord = await client.files.create({
      file: resolvedFile.file,
      purpose: "user_data",
    });

    const vectorStoreFile = await client.vectorStores.files.createAndPoll(
      vectorStoreId,
      {
        file_id: fileRecord.id,
        attributes: sourceAttributes(source),
      },
    );

    return {
      source_id: source.id,
      file_id: fileRecord.id,
      vector_store_file_id: vectorStoreFile.id,
      status: vectorStoreFile.status,
      filename: resolvedFile.fileName,
    };
  } finally {
    await resolvedFile.cleanup();
  }
}

async function ingestSource(
  client: OpenAI,
  vectorStoreId: string,
  source: SourceRecord,
  existingFilesBySource: Map<string, ExistingVectorStoreFile[]>,
  reindex: boolean,
) {
  const existingFiles = existingFilesBySource.get(source.id) ?? [];

  if (existingFiles.length > 0 && reindex) {
    console.log(`Reindexing ${source.id} by replacing existing vector store files...`);
    await deleteExistingVectorStoreFiles(client, vectorStoreId, existingFiles);
  } else if (existingFiles.length > 0 && hasReusableExistingFile(existingFiles)) {
    return {
      source_id: source.id,
      status: "skipped_existing",
      vector_store_file_ids: existingFiles.map((file) => file.id),
      existing_statuses: existingFiles.map((file) => file.status),
      last_errors: existingFiles
        .map((file) => file.last_error)
        .filter((value): value is string => value !== null),
    };
  } else if (existingFiles.length > 0) {
    console.log(`Cleaning failed or cancelled files for ${source.id} before retrying...`);
    await deleteExistingVectorStoreFiles(client, vectorStoreId, existingFiles);
  }

  console.log(`Uploading ${source.id}...`);
  return uploadSource(client, vectorStoreId, source);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const catalog = getSourceCatalog();

  const sources = catalog.sources.filter((source) => {
    if (source.usage !== "authoritative_domain_source") {
      return false;
    }

    if (options.sourceId) {
      return source.id === options.sourceId;
    }

    return true;
  });

  if (sources.length === 0) {
    throw new Error("No matching authoritative sources found.");
  }

  const vectorStoreId = getVectorStoreId(options.vectorStoreId);

  if (!options.dryRun && !vectorStoreId) {
    throw new Error(
      "OPENAI_VECTOR_STORE_ID or --vector-store-id is required unless --dry-run is used.",
    );
  }

  if (options.dryRun) {
    console.log(
      JSON.stringify(
        {
          dry_run: true,
          vector_store_id: vectorStoreId || null,
          sources: sources.map((source) => ({
            id: source.id,
            title: source.title,
            authority: source.authority,
            local_path: source.local_path,
            remote_url: source.remote_url,
            attributes: sourceAttributes(source),
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  const client = getClient();
  const existingFilesBySource = await listExistingVectorStoreFiles(client, vectorStoreId);
  const results = [];

  for (const source of sources) {
    const result = await ingestSource(
      client,
      vectorStoreId,
      source,
      existingFilesBySource,
      options.reindex,
    );
    results.push(result);
  }

  console.log(
    JSON.stringify(
      {
        dry_run: false,
        reindex: options.reindex,
        vector_store_id: vectorStoreId,
        results,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : "Unknown ingestion error",
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
