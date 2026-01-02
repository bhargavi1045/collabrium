import DOMPurify from "isomorphic-dompurify";

export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") return "";
  return DOMPurify.sanitize(input).trim();
}


export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      sanitized[key] = sanitizeString(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
}
