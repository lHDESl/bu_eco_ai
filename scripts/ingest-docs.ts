import { createReadStream, existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import OpenAI, { toFile } from "openai";
import { getSourceCatalog, type SourceRecord } from "../src/lib/source-catalog";

type CliOptions = {
  dryRun: boolean;
  sourceId?: string;
  vectorStoreId?: string;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      options.dryRun = true;
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
  const results = [];

  for (const source of sources) {
    console.log(`Uploading ${source.id}...`);
    const result = await uploadSource(client, vectorStoreId, source);
    results.push(result);
  }

  console.log(
    JSON.stringify(
      {
        dry_run: false,
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
