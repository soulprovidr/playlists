import { RssValidationResult } from "./rss.types";

/**
 * Validates an RSS feed URL by checking if it's accessible and appears to be a valid feed
 * Checks:
 * - URL accessibility (HEAD request)
 * - Content-Type header for XML/RSS/Atom indicators
 * - URL patterns (.rss, .xml, /feed)
 */
export const validateRssUrl = async (
  url: string,
): Promise<RssValidationResult> => {
  try {
    // Attempt to fetch the URL with HEAD request to check accessibility
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Playlists-App/1.0",
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `URL is not accessible (HTTP ${response.status})`,
      };
    }

    const contentType = response.headers.get("content-type") || "";

    // Check if it's likely an RSS/Atom feed
    if (isLikelyRssFeed(url, contentType)) {
      return {
        valid: true,
        config: {
          feedUrl: url,
        },
      };
    }

    return {
      valid: false,
      error:
        "URL does not appear to be a valid RSS feed. Expected XML content type or RSS/feed URL pattern",
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Failed to validate URL",
    };
  }
};

/**
 * Checks if a URL or content type indicates an RSS/Atom feed
 */
export const isLikelyRssFeed = (url: string, contentType?: string): boolean => {
  // Check content type
  if (contentType) {
    if (
      contentType.includes("xml") ||
      contentType.includes("rss") ||
      contentType.includes("atom")
    ) {
      return true;
    }
  }

  // Check URL patterns
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.endsWith(".rss") ||
    lowerUrl.endsWith(".xml") ||
    lowerUrl.includes("/feed") ||
    lowerUrl.includes("/rss")
  );
};
