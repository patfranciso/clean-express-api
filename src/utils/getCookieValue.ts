export default function getCookieValue(
  setCookieHeaders: string | string[] | undefined,
  cookieName: string
): string | undefined {
  if (!setCookieHeaders) {
    return undefined;
  }

  // Ensure it's an array
  const headers = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : [setCookieHeaders];

  for (const header of headers) {
    const parts = header.split(";");
    const nameValue = parts[0].trim(); // e.g., "mycookie=myvalue"

    if (nameValue.startsWith(`${cookieName}=`)) {
      // Found the cookie! Extract the value
      return nameValue.substring(cookieName.length + 1);
    }
  }

  return undefined; // Cookie not found
}
