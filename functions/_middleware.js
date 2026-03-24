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
    title: "Animal Rescue Directory | Recyclish",
    description:
      "Find animal shelters and rescues near you. Every life deserves a second chance.",
    image: "https://www.recyclish.pet/og-image.png",
    url: "https://www.recyclish.pet",
    siteName: "Recyclish",
    type: "website",
  },
  paths: {
    "/tags": {
      title: "Mobi Tags\u2122 | Recyclish",
      description:
        "Turn any bag into a recycling tote. Hang it. Carry the mission. Collectible tags that support animal rescue.",
      image: "https://www.recyclish.pet/og-tags.png",
    },
    "/mobi": {
      title: "Meet Mobi | Recyclish",
      description:
        "Mobi believes every life deserves a second chance. Explore rescue stories, recycling tips, and the Mobi collection.",
      image: "https://www.recyclish.pet/og-mobi.png",
    },
  },
};

// ─── Helper: escape HTML attribute values ────────────────────

function esc(str) {
  return str.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── HTMLRewriter Handlers ───────────────────────────────────────────────

class OGMetaInjector {
  constructor(config) {
    this.config = config;
    this.injected = false;
  }

  element(el) {
    if (this.injected) return;
    this.injected = true;

    const c = this.config;

    // Core OG tags
    el.append(`<meta property="og:title" content="${esc(c.title)}" />`, { html: true });
    el.append(`<meta property="og:description" content="${esc(c.description)}" />`, { html: true });
    el.append(`<meta property="og:image" content="${esc(c.image)}" />`, { html: true });
    el.append(`<meta property="og:url" content="${esc(c.url)}" />`, { html: true });
    el.append(`<meta property="og:type" content="${esc(c.type)}" />`, { html: true });
    el.append(`<meta property="og:site_name" content="${esc(c.siteName)}" />`, { html: true });

    // Twitter Card tags
    el.append(`<meta name="twitter:card" content="summary_large_image" />`, { html: true });
    el.append(`<meta name="twitter:title" content="${esc(c.title)}" />`, { html: true });
    el.append(`<meta name="twitter:description" content="${esc(c.description)}" />`, { html: true });
    el.append(`<meta name="twitter:image" content="${esc(c.image)}" />`, { html: true });

    // Standard meta description
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

// ─── Middleware Entry Point ──────────────────────────────────────────────

export async function onRequest(context) {
  // Let the request pass through to Pages first
  const response = await context.next();

  // Only transform HTML responses
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // Determine which config to use based on the request path
  const url = new URL(context.request.url);
  const pathConfig = SITE_CONFIG.paths[url.pathname];
  const finalConfig = pathConfig
    ? { ...SITE_CONFIG.default, ...pathConfig, url: SITE_CONFIG.default.url + url.pathname }
    : SITE_CONFIG.default;

  // Use HTMLRewriter to inject OG tags into <head> and update <title>
  return new HTMLRewriter()
    .on("head", new OGMetaInjector(finalConfig))
    .on("title", new TitleRewriter(finalConfig.title))
    .transform(response);
}
