import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

export function getCleanSlug(slug: string): string {
  if (!slug) return "";
  if (slug.startsWith('http://') || slug.startsWith('https://')) {
    try {
      const url = new URL(slug);
      const pathParts = url.pathname.split('/');
      return pathParts[pathParts.length - 1] || slug;
    } catch {
      return slug;
    }
  }
  return slug;
}
