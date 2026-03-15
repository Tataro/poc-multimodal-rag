import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { config } from "@/lib/config";

type SaveTarget = "images" | "video" | "posters";

const roots: Record<SaveTarget, string> = {
  images: config.imageRoot,
  video: config.videoRoot,
  posters: config.posterRoot,
};

export async function ensureStorage() {
  await Promise.all(
    Object.values(roots).map((dir) => mkdir(dir, { recursive: true })),
  );
}

export async function saveBuffer(params: {
  buffer: Buffer;
  originalName: string;
  target: SaveTarget;
}) {
  await ensureStorage();
  const ext = path.extname(params.originalName);
  const safeBase = path
    .basename(params.originalName, ext)
    .replaceAll(/[^a-zA-Z0-9-_]+/g, "-")
    .toLowerCase();
  const fileName = `${safeBase || "asset"}-${randomUUID().slice(0, 8)}${ext}`;
  const absolutePath = path.join(roots[params.target], fileName);
  await writeFile(absolutePath, params.buffer);

  return {
    fileName,
    absolutePath,
    publicPath: `${config.publicUploadRoot}/${params.target}/${fileName}`,
  };
}
