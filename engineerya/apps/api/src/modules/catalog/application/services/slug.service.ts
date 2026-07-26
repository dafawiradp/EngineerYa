import { Injectable } from "@nestjs/common";

/**
 * Deterministic slugify + collision-avoidance. Used by both Book and
 * Category creation so URLs stay stable, human-readable, and unique
 * without the caller ever having to think about it.
 */
@Injectable()
export class SlugService {
  slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Appends a short random suffix if the base slug is already taken.
   * `exists` is injected so this stays framework/persistence agnostic.
   */
  async unique(base: string, exists: (candidate: string) => Promise<boolean>): Promise<string> {
    const baseSlug = this.slugify(base) || "item";
    let candidate = baseSlug;
    let attempt = 0;

    while (await exists(candidate)) {
      attempt += 1;
      candidate = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      if (attempt > 10) {
        // Astronomically unlikely, but never loop forever.
        candidate = `${baseSlug}-${Date.now()}`;
        break;
      }
    }

    return candidate;
  }
}
