import { extname } from "path";

export function sanitizeFileName(fileName: string): string {
  const extension = extname(fileName);
  const cleanedName = fileName
    .replace(extension, "")
    .replace(/[^a-zA-Z0-9]/g, "");

  return `${cleanedName}${extension}`;
}

export function isImageFileName(fileName: string) {
  // Regular expression to match image file extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

  // Test if the file name matches any of the image extensions
  return imageExtensions.test(fileName);
}
