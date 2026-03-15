import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

import { config } from "@/lib/config";

const execFileAsync = promisify(execFile);

function getFfprobePath() {
  return config.FFMPEG_PATH.endsWith("ffmpeg")
    ? config.FFMPEG_PATH.replace(/ffmpeg$/, "ffprobe")
    : "ffprobe";
}

export async function ensureFfmpegBinary() {
  try {
    await execFileAsync(config.FFMPEG_PATH, ["-version"]);
    return true;
  } catch {
    return false;
  }
}

export async function getVideoDuration(videoPath: string) {
  const { stdout } = await execFileAsync(getFfprobePath(), [
    "-v",
    "quiet",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    videoPath,
  ]);

  return Number.parseFloat(stdout.trim());
}

export async function chunkVideoFile(
  inputPath: string,
  outputDir: string,
  segmentDuration = 97,
  overlap = 15,
) {
  const duration = await getVideoDuration(inputPath);
  const outputs: Array<{ path: string; chunkIndex: number }> = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < duration) {
    const outputPath = path.join(
      outputDir,
      `${path.basename(inputPath, path.extname(inputPath))}-chunk-${String(chunkIndex).padStart(3, "0")}.mp4`,
    );

    await execFileAsync(config.FFMPEG_PATH, [
      "-y",
      "-ss",
      String(start),
      "-t",
      String(segmentDuration),
      "-i",
      inputPath,
      "-c",
      "copy",
      outputPath,
    ]);

    outputs.push({ path: outputPath, chunkIndex });
    start += segmentDuration - overlap;
    chunkIndex += 1;
  }

  return outputs;
}

export async function extractPoster(videoPath: string, outputPath: string) {
  const duration = await getVideoDuration(videoPath);
  const midpoint = Math.max(duration / 2, 0.1);
  await execFileAsync(config.FFMPEG_PATH, [
    "-y",
    "-ss",
    midpoint.toFixed(2),
    "-i",
    videoPath,
    "-frames:v",
    "1",
    outputPath,
  ]);
  await access(outputPath, constants.R_OK);
  return outputPath;
}
