/**
 * Lawrence Murry Professional Portfolio
 * Cloudflare Workers / Workers Static Assets
 *
 * This Worker:
 *   - Serves index.html at /
 *   - Serves static assets through the ASSETS binding
 *   - Adds security headers
 *   - Adds cache headers for static assets
 *   - Handles common canonical redirects
 *   - Provides a basic health endpoint
 *
 * Cloudflare Workers runtime:
 * https://developers.cloudflare.com/workers/
 */

const SITE_URL = "https://lawrencemurry.com";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(self)",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Cross-Origin-Resource-Policy": "same-origin",
};

/**
 * Add security headers without modifying the original response.
 */
function withSecurityHeaders(response, additionalHeaders = {}) {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  for (const [key, value] of Object.entries(additionalHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Return a simple health-check response.
 */
function healthResponse() {
  return new Response(
    JSON.stringify({
      status: "ok",
      site: "lawrencemurry.com",
      service: "Cloudflare Worker",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Cache-Control": "no-store",
        ...SECURITY_HEADERS,
      },
    },
  );
}

/**
 * Redirect a URL to the canonical HTTPS hostname.
 */
function canonicalRedirect(request) {
  const url = new URL(request.url);

  if (url.protocol !== "https:") {
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }

  /**
   * Normalize www.lawrencemurry.com to lawrencemurry.com.
   */
  if (url.hostname === "www.lawrencemurry.com") {
    url.hostname = "lawrencemurry.com";
    return Response.redirect(url.toString(), 301);
  }

  return null;
}

/**
 * Determine whether a request is for a static asset.
 */
function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/img/") ||
    pathname.startsWith("/assets/") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".pdf") ||
    pathname.endsWith(".xml") ||
    pathname.endsWith(".txt") ||
    pathname.endsWith(".json") ||
    pathname.endsWith(".webmanifest") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js"
  );
}

/**
 * Add appropriate caching to static files.
 */
function staticAssetHeaders(response) {
  const headers = new Headers(response.headers);

  /**
   * Images, PDFs, JavaScript, CSS, etc. can be cached.
   *
   * Change this to immutable only when you use versioned filenames.
   */
  headers.set(
    "Cache-Control",
    "public, max-age=86400, stale-while-revalidate=604800",
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Return index.html from the Cloudflare static asset binding.
 *
 * This is preferable to embedding the entire HTML document inside
 * a JavaScript template literal.
 */
async function serveHome(request, env) {
  if (!env.ASSETS) {
    return new Response(
      "ASSETS binding is not configured. Check wrangler.toml.",
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
          ...SECURITY_HEADERS,
        },
      },
    );
  }

  const url = new URL(request.url);

  /**
   * Fetch the physical index.html file from the static asset system.
   */
  url.pathname = "/index.html";

  const assetRequest = new Request(url.toString(), {
    method: "GET",
    headers: request.headers,
  });

  const response = await env.ASSETS.fetch(assetRequest);

  if (!response.ok) {
    return withSecurityHeaders(
      new Response(
        "Unable to load the portfolio page.",
        {
          status: 500,
          headers: {
            "Content-Type": "text/plain; charset=UTF-8",
          },
        },
      ),
    );
  }

  return withSecurityHeaders(response, {
    "Content-Type": "text/html; charset=UTF-8",

    /**
     * HTML should be revalidated so content updates propagate quickly.
     */
    "Cache-Control":
      "public, max-age=0, must-revalidate",

    /**
     * Prevent browsers/proxies from MIME-sniffing.
     */
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data: https:",
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
      "frame-src 'self' https:",
      "object-src 'self'",
      "base-uri 'self'",
      "form-action 'self' mailto:",
      "upgrade-insecure-requests",
    ].join("; "),
  });
}

/**
 * Main Cloudflare Worker.
 */
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      /**
       * Only GET and HEAD are needed for this portfolio.
       */
      if (
        request.method !== "GET" &&
        request.method !== "HEAD"
      ) {
        return withSecurityHeaders(
          new Response("Method Not Allowed", {
            status: 405,
            headers: {
              Allow: "GET, HEAD",
            },
          }),
        );
      }

      /**
       * Health check.
       *
       * Useful for Cloudflare monitoring and uptime services.
       */
      if (
        url.pathname === "/health" ||
        url.pathname === "/healthz"
      ) {
        return healthResponse();
      }

      /**
       * Canonical hostname / HTTPS redirects.
       */
      const redirect = canonicalRedirect(request);

      if (redirect) {
        return redirect;
      }

      /**
       * Homepage.
       */
      if (
        url.pathname === "/" ||
        url.pathname === "/index.html"
      ) {
        return serveHome(request, env);
      }

      /**
       * Let Cloudflare's static asset system serve:
       *
       *   /img/*
       *   /manifest.json
       *   /sw.js
       *   PDFs
       *   ecommerce.html
       *   privacy.html
       *   etc.
       */
      if (isStaticAsset(url.pathname)) {
        if (!env.ASSETS) {
          return withSecurityHeaders(
            new Response("Static asset binding unavailable.", {
              status: 500,
            }),
          );
        }

        const response = await env.ASSETS.fetch(request);

        if (response.status === 404) {
          return withSecurityHeaders(
            new Response("Not Found", {
              status: 404,
              headers: {
                "Content-Type":
                  "text/plain; charset=UTF-8",
              },
            }),
          );
        }

        return staticAssetHeaders(
          withSecurityHeaders(response),
        );
      }

      /**
       * Try the requested path as a normal static asset.
       *
       * This allows:
       *
       *   /privacy.html
       *   /ecommerce.html
       *   /Proposal-Manager-Resume-Lawrence-Murry.pdf
       *
       * to work without adding individual routes.
       */
      if (env.ASSETS) {
        const response = await env.ASSETS.fetch(request);

        if (response.ok) {
          return staticAssetHeaders(
            withSecurityHeaders(response),
          );
        }
      }

      /**
       * Custom 404 page.
       */
      return withSecurityHeaders(
        new Response(
          `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page Not Found | Lawrence Murry</title>
  <meta name="robots" content="noindex">
  <style>
    :root {
      color-scheme: light dark;
      --primary: #660000;
      --background: #f8fafc;
      --text: #1f2937;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 2rem;
      background: var(--background);
      color: var(--text);
      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
      text-align: center;
    }

    main {
      width: min(680px, 100%);
      padding: 3rem 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 18px 45px rgba(15, 23, 42, .12);
    }

    h1 {
      margin: 0 0 1rem;
      color: var(--primary);
      font-size: clamp(2.5rem, 8vw, 5rem);
    }

    p {
      color: #64748b;
      line-height: 1.7;
    }

    a {
      display: inline-block;
      margin-top: 1rem;
      padding: .75rem 1.1rem;
      background: var(--primary);
      color: white;
      border-radius: .6rem;
      text-decoration: none;
      font-weight: 800;
    }
  </style>
</head>

<body>
  <main>
    <h1>404</h1>

    <h2>
      Page Not Found
    </h2>

    <p>
      The page you're looking for doesn't exist.
    </p>

    <a href="/">
      Return to Lawrence Murry
    </a>
  </main>
</body>
</html>`,
          {
            status: 404,
            headers: {
              "Content-Type":
                "text/html; charset=UTF-8",
              "Cache-Control":
                "public, max-age=300",
            },
          },
        ),
      );
    } catch (error) {
      console.error(
        "Unhandled Worker error:",
        error,
      );

      return withSecurityHeaders(
        new Response(
          "Internal Server Error",
          {
            status: 500,
            headers: {
              "Content-Type":
                "text/plain; charset=UTF-8",
              "Cache-Control":
                "no-store",
            },
          },
        ),
      );
    }
  },
};
