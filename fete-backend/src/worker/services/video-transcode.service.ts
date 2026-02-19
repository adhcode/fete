import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';
import * as os from 'os';

export interface VideoMetadata {
  width: number;
  height: number;
  durationSec: number;
  format: string;
}

export interface TranscodeResult {
  videoPath: string;
  posterPath: string;
  metadata: VideoMetadata;
}

@Injectable()
export class VideoTranscodeService {
  private readonly logger = new Logger(VideoTranscodeService.name);
  private readonly MAX_DURATION_SEC = 15;

  async transcodeVideo(
    inputBuffer: Buffer,
    options?: {
      maxDurationSec?: number;
    },
  ): Promise<TranscodeResult> {
    const maxDuration = options?.maxDurationSec || this.MAX_DURATION_SEC;
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'fete-video-'));
    const inputPath = join(tempDir, 'input.mp4');
    const outputPath = join(tempDir, 'output.mp4');
    const posterPath = join(tempDir, 'poster.jpg');

    try {
      // Write input buffer to temp file
      await fs.writeFile(inputPath, inputBuffer);

      // Probe video to get metadata
      const metadata = await this.probeVideo(inputPath);
      this.logger.log(
        `Video metadata: ${metadata.width}x${metadata.height}, ${metadata.durationSec}s`,
      );

      // Validate duration
      if (metadata.durationSec > maxDuration) {
        throw new Error(
          `Video duration ${metadata.durationSec}s exceeds maximum ${maxDuration}s`,
        );
      }

      // Transcode video
      await this.runFfmpeg(inputPath, outputPath);

      // Generate poster frame at 1 second
      await this.generatePoster(outputPath, posterPath);

      // Get final metadata from transcoded video
      const finalMetadata = await this.probeVideo(outputPath);

      return {
        videoPath: outputPath,
        posterPath,
        metadata: finalMetadata,
      };
    } catch (error) {
      // Cleanup on error
      await this.cleanup(tempDir);
      throw error;
    }
  }

  private async probeVideo(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const args = [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height,duration:format=duration',
        '-of',
        'json',
        videoPath,
      ];

      const ffprobe = spawn('ffprobe', args);
      let stdout = '';
      let stderr = '';

      ffprobe.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ffprobe.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ffprobe failed: ${stderr}`));
          return;
        }

        try {
          const data = JSON.parse(stdout);
          const stream = data.streams?.[0];
          const format = data.format;

          if (!stream) {
            reject(new Error('No video stream found'));
            return;
          }

          const duration = parseFloat(stream.duration || format?.duration || '0');

          resolve({
            width: stream.width,
            height: stream.height,
            durationSec: Math.round(duration),
            format: format?.format_name || 'unknown',
          });
        } catch (err) {
          reject(new Error(`Failed to parse ffprobe output: ${err.message}`));
        }
      });
    });
  }

  private async runFfmpeg(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-i',
        inputPath,
        // Video codec: H.264
        '-c:v',
        'libx264',
        // Preset for encoding speed/quality tradeoff
        '-preset',
        'medium',
        // Profile for compatibility
        '-profile:v',
        'high',
        '-level',
        '4.0',
        // Max resolution 1080p, preserve aspect ratio
        '-vf',
        'scale=w=min(1920\\,iw):h=min(1080\\,ih):force_original_aspect_ratio=decrease,fps=fps=30',
        // Bitrate control
        '-b:v',
        '5M',
        '-maxrate',
        '6.5M',
        '-bufsize',
        '11M',
        // Audio codec: AAC
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-ar',
        '44100',
        // Enable faststart for web playback
        '-movflags',
        '+faststart',
        // Pixel format for compatibility
        '-pix_fmt',
        'yuv420p',
        // Overwrite output
        '-y',
        outputPath,
      ];

      this.logger.log(`Running ffmpeg: ${args.join(' ')}`);

      const ffmpeg = spawn('ffmpeg', args);
      let stderr = '';

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(`ffmpeg failed: ${stderr}`);
          reject(new Error(`ffmpeg failed with code ${code}`));
          return;
        }
        this.logger.log('Video transcoding completed');
        resolve();
      });
    });
  }

  private async generatePoster(videoPath: string, posterPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-i',
        videoPath,
        '-ss',
        '00:00:01.000',
        '-vframes',
        '1',
        '-vf',
        'scale=w=min(1920\\,iw):h=min(1080\\,ih):force_original_aspect_ratio=decrease',
        '-q:v',
        '2',
        '-y',
        posterPath,
      ];

      const ffmpeg = spawn('ffmpeg', args);
      let stderr = '';

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(`Poster generation failed: ${stderr}`);
          reject(new Error(`Poster generation failed with code ${code}`));
          return;
        }
        this.logger.log('Poster frame generated');
        resolve();
      });
    });
  }

  async cleanup(tempDir: string): Promise<void> {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      this.logger.log(`Cleaned up temp directory: ${tempDir}`);
    } catch (err) {
      this.logger.warn(`Failed to cleanup temp directory: ${err.message}`);
    }
  }

  async readFile(path: string): Promise<Buffer> {
    return fs.readFile(path);
  }
}
