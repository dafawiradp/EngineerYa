import { Injectable } from "@nestjs/common";
import sharp from "sharp";
import { WatermarkContext } from "../domain/watermark-context";

/**
 * Composites a per-request, per-user watermark onto a rendered page
 * image. This is deliberately done SERVER-SIDE, PER-REQUEST — the base
 * page image in R2 is unwatermarked, and the watermarked output is never
 * cached or written back to storage. That means:
 *   - the same base page produces a DIFFERENT image for every user/session,
 *     so a redistributed image can (in principle) be traced back;
 *   - nothing watermark-related is ever a static, shareable URL.
 *
 * Per the project brief: this raises the cost of piracy, it does not
 * claim to prevent it outright.
 */
@Injectable()
export class WatermarkService {
  async apply(baseImage: Buffer, ctx: WatermarkContext): Promise<Buffer> {
    const meta = await sharp(baseImage).metadata();
    const width = meta.width ?? 1200;
    const height = meta.height ?? 1600;

    const overlaySvg = this.buildOverlaySvg(width, height, ctx);

    return sharp(baseImage)
      .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  private buildOverlaySvg(width: number, height: number, ctx: WatermarkContext): string {
    const label = `${ctx.userEmail} · ${ctx.timestamp.toISOString()}`;
    const footer = `EngineerYa · ${ctx.userEmail} · Book ${ctx.bookId} · Page ${ctx.page} · ${ctx.sessionId.slice(0, 8)}`;

    // Diagonal, low-opacity repeating tiles across the whole page (hard
    // to crop out without damaging the readable content) plus a small
    // solid footer strip with the fully identifying details.
    const tileText = this.escapeXml(label);
    const tiles: string[] = [];
    const stepX = 260;
    const stepY = 180;
    for (let y = -stepY; y < height + stepY; y += stepY) {
      for (let x = -stepX; x < width + stepX; x += stepX) {
        tiles.push(
          `<text x="${x}" y="${y}" transform="rotate(-30 ${x} ${y})" font-size="14" fill="rgba(120,120,120,0.22)" font-family="sans-serif">${tileText}</text>`
        );
      }
    }

    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${tiles.join("\n  ")}
  <rect x="0" y="${height - 28}" width="${width}" height="28" fill="rgba(0,0,0,0.55)" />
  <text x="10" y="${height - 9}" font-size="13" fill="white" font-family="monospace">${this.escapeXml(footer)}</text>
</svg>`.trim();
  }

  private escapeXml(input: string): string {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
