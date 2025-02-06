import * as ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
import { Readable } from "stream";
import { sizeFile } from './sizeFile.util';
import { isPermissibleSize } from './isPermissibleSize';
import * as ffmpegStatic from "ffmpeg-static";
import * as ffprobeStatic from "ffprobe-static";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export const checkVideoFile = async (buffer, type: string, subspecies: string): Promise<[boolean | Buffer, number]> => {
    const {width, height, filePath, duration} = await processVideo(buffer);
    if(!width || !height) return [false, duration];
    if(isPermissibleSize(width, height, type, subspecies)){
      await fs.promises.rm(filePath, { recursive: true, force: true });
      return [true, duration];
    } 
    const newFile = await resizeVideo(filePath, 
      sizeFile[type][`${subspecies}PV`].standardWidth, 
      sizeFile[type][`${subspecies}PV`].standardHeight);
    
    await fs.promises.rm(filePath, { recursive: true, force: true });
    return [newFile, duration];
}

export const longStories = async (fileBuffer, segmentDuration: number): Promise<Buffer[]> => {
  const taskDir = path.join(os.tmpdir(), `task-${Date.now()}`);
  const tempFilePath = path.join(taskDir, `temp-video.mp4`);
  const segmentDir = path.join(taskDir, "segments");
  const res = await splitVideo(fileBuffer, segmentDuration, taskDir, tempFilePath, segmentDir);
  await fs.promises.rm(taskDir, { recursive: true, force: true });
  return res;
}


export const bufferToStream = (buffer) => {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}


export const processVideo = 
  async (buffer: Buffer): Promise<{ width: number; height: number, filePath: string, duration: number}> => {
    const processDir = path.join(os.tmpdir(), `process-${Date.now()}`);
    const tempFilePath = path.join(processDir, `temp-video.mov`);
    await fs.promises.mkdir(processDir, { recursive: true });
    await fs.promises.writeFile(tempFilePath, buffer);

  try {
    return await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath).ffprobe((err, metadata) => {
        if (err) {
          console.error("FFmpeg error:", err);
          return reject(err);
        }

        const videoStream = metadata.streams?.find(
          (stream) => stream.codec_type === "video"
        );

        if (!videoStream) {
          return reject(new Error("No video stream found in metadata"));
        }


        resolve({
          width: videoStream.width,
          height: videoStream.height,
          filePath: tempFilePath,
          duration: metadata.format.duration,
        });
      });
    });
  } catch (err) {
    console.error(err);
  }
};


export const resizeVideo = async (inputFilePath: string, targetWidth: number, targetHeight: number): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const passThrough = new PassThrough();
    const chunks: Buffer[] = [];

    ffmpeg(inputFilePath)
      .videoCodec("libx264")
      .size(`${targetWidth}x${targetHeight}`)
      .autopad(true, "black")
      .format("mp4")
      .pipe(passThrough);

    passThrough.on("data", (chunk) => chunks.push(chunk));
    passThrough.on("end", () => resolve(Buffer.concat(chunks)));
    passThrough.on("error", (err) => reject(err));
})}

export const splitVideo = async (fileBuffer, segmentDuration: number, taskDir, tempFilePath, segmentDir): Promise<Buffer[]> => {
  await fs.promises.mkdir(taskDir, { recursive: true });
  await fs.promises.mkdir(segmentDir, { recursive: true });
  await fs.promises.writeFile(tempFilePath, fileBuffer);

  try {
    return new Promise<Buffer[]>((resolve, reject) => {
      const segmentPattern = path.join(segmentDir, "segment-%03d.mp4");

      ffmpeg(tempFilePath)
        .outputOptions([
          "-f segment",
          `-segment_time ${segmentDuration}`,
          "-reset_timestamps 1",
        ])
        .on("start", (commandLine) => {
          console.log("FFmpeg command:", commandLine);
        })
        .on("error", (err) => {
          console.error("Error splitting video:", err);
          reject(err);
        })
        .on("end", async () => {
          console.log("Video splitting completed.");

          const segmentFiles = await fs.promises.readdir(segmentDir);
          const buffers: Buffer[] = [];

          for (const file of segmentFiles) {
            const filePath = path.join(segmentDir, file);
            const fileBuffer = await fs.promises.readFile(filePath);
            buffers.push(fileBuffer);
            await fs.promises.unlink(filePath);
          }

          await fs.promises.rmdir(segmentDir);
          resolve(buffers);
        })
        .save(segmentPattern);
    });
  }catch (err) {
    console.log('split-video error', err);
  }
};