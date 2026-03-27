/**
 * Recyclish OG Meta Tag Injector — Cloudflare Pages Function
 *
 * Intercepts HTML responses from the React SPA and injects
 * Open Graph + Twitter Card meta tags into <head>.
 *
 * Social share crawlers (Facebook, Twitter, LinkedIn, iMessage, Slack)
 * don't execute JavaScript — they only read the initial HTML. Since
 * this is a React SPA, crawlers see blank pages without this middleware.
 *
 * Drop this file at: functions/_middleware.js in the Pages repo.
 * Cloudflare Pages will run it on every request automatically.
 */

// ─── OG Tag Configuration ────────────────────────────────────────────────
// Default tags + per-path overrides. Update as pages evolve.

const SITE_CONFIG = {
  default: {
    title: "National Recycling Directory | Recyclish",
    description:
      "Find recycling centers, drop-off locations, and e-waste facilities near you. The definitive national recycling directory.",
    image: "https://www.recyclish.info/og-image.jpg",
    url: "https://www.recyclish.info",
    siteName: "Recyclish",
    type: "website",
  },
  paths: {
    "/directory": {
      title: "Recycling Center Directory | Recyclish",
      description:
        "Search thousands of recycling centers, drop-off locations, and hazardous waste facilities across the United States.",
      image: "https://www.recyclish.info/og-directory.jpg",
    },
    "/map": {
      title: "Recycling Map | Recyclish",
      description:
        "Interactive map of recycling centers and drop-off locations near you. Find where to recycle anything.",
      image: "https://www.recyclish.info/og-map.jpg",
    },
    "/submit": {
      title: "Add a Recycling Location | Recyclish",
      description:
        "Help grow the national recycling directory by submitting a recycling center, drop-off location, or e-waste facility.",
      image: "https://www.recyclish.info/og-image.jpg",
    },
    "/blog": {
      title: "Recycling Tips & Guides | Recyclish Blog",
      description:
        "Practical recycling guides, e-waste disposal tips, composting advice, and sustainability resources.",
      image: "https://www.recyclish.info/og-blog.jpg",
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────
const esc = (s) => s.replace(/"/g, "&quot;");

class OGMetaInjector {
  constructor(config) {
    this.config = config;
    this.injected = false;
  }
  element(el) {
    if (this.injected) return;
    this.injected = true;
    const c = this.config;
    el.append(`<meta property="og:title" content="${esc(c.title)}" />`, { html: true });
    el.append(`<meta property="og:description" content="${esc(c.description)}" />`, { html: true });
    el.append(`<meta property="og:image" content="${esc(c.image)}" />`, { html: true });
    el.append(`<meta property="og:url" content="${esc(c.url)}" />`, { html: true });
    el.append(`<meta property="og:type" content="${esc(c.type)}" />`, { html: true });
    el.append(`<meta property="og:site_name" content="${esc(c.siteName)}" />`, { html: true });
    el.append(`<meta name="twitter:card" content="summary_large_image" />`, { html: true });
    el.append(`<meta name="twitter:title" content="${esc(c.title)}" />`, { html: true });
    el.append(`<meta name="twitter:description" content="${esc(c.description)}" />`, { html: true });
    el.append(`<meta name="twitter:image" content="${esc(c.image)}" />`, { html: true });
    el.append(`<meta name="description" content="${esc(c.description)}" />`, { html: true });
  }
}

class TitleRewriter {
  constructor(title) {
    this.title = title;
  }
  element(el) {
    el.setInnerContent(this.title);
  }
}

// ─── Request Handler ──────────────────────────────────────────────────────
export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const url = new URL(context.request.url);
  const pathConfig = SITE_CONFIG.paths[url.pathname];
  const finalConfig = pathConfig
    ? { ...SITE_CONFIG.default, ...pathConfig, url: SITE_CONFIG.default.url + url.pathname }
    : SITE_CONFIG.default;

  return new HTMLRewriter()
    .on("head", new OGMetaInjector(finalConfig))
    .on("title", new TitleRewriter(finalConfig.title))
    .transform(response);
}
