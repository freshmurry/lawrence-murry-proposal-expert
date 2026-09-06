/**
 * Lawrence Murry Proposal Expert
 * Cloudflare Workers + Static Assets
 *
 * Website:
 * https://lawrencemurry.com/
 *
 * Static files:
 * ./public/*
 *
 * API Functions:
 * ./functions/api/*
 */

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",

  "X-Frame-Options": "SAMEORIGIN",

  "Referrer-Policy":
    "strict-origin-when-cross-origin",

  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(self)",

  "Cross-Origin-Opener-Policy":
    "same-origin-allow-popups",
};

function addSecurityHeaders(
  response,
  extraHeaders = {},
) {
  const headers = new Headers(
    response.headers,
  );

  for (
    const [name, value]
    of Object.entries(SECURITY_HEADERS)
  ) {
    headers.set(name, value);
  }

  for (
    const [name, value]
    of Object.entries(extraHeaders)
  ) {
    headers.set(name, value);
  }

  return new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers,
    },
  );
}

function json(
  data,
  status = 200,
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=UTF-8",

        "Cache-Control":
          "no-store",

        ...SECURITY_HEADERS,
      },
    },
  );
}

async function handleRequest(
  request,
  env,
) {
  const url =
    new URL(request.url);

  /*
   * Only allow methods required by
   * this website.
   */
  if (
    request.method !== "GET" &&
    request.method !== "HEAD"
  ) {
    return addSecurityHeaders(
      new Response(
        "Method Not Allowed",
        {
          status: 405,
          headers: {
            Allow: "GET, HEAD",
          },
        },
      ),
    );
  }

  if (url.pathname === "/api/kv") {
    if (!env.VISITOR_COUNTER) {
      return json(
        {
          error:
            "KV namespace binding is not configured",
        },
        503,
      );
    }

    await env.VISITOR_COUNTER.put(
      "KEY",
      "VALUE",
    );

    const value =
      await env.VISITOR_COUNTER.get("KEY");

    const allKeys =
      await env.VISITOR_COUNTER.list();

    await env.VISITOR_COUNTER.delete("KEY");

    return json({
      value,
      allKeys,
    });
  }

  /*
   * Health endpoint.
   *
   * Useful for uptime monitoring and
   * Cloudflare deployment verification.
   */
  if (
    url.pathname === "/health" ||
    url.pathname === "/healthz"
  ) {
    return json({
      status: "ok",
      service:
        "lawrencemurry.com",
      runtime:
        "Cloudflare Workers",
      timestamp:
        new Date().toISOString(),
    });
  }

  /*
   * Canonical hostname.
   *
   * Redirect:
   * www.lawrencemurry.com
   * ->
   * lawrencemurry.com
   */
  if (
    url.hostname ===
    "www.lawrencemurry.com"
  ) {
    const canonical =
      new URL(request.url);

    canonical.hostname =
      "lawrencemurry.com";

    return Response.redirect(
      canonical.toString(),
      301,
    );
  }

  /*
   * Cloudflare Static Assets.
   *
   * This handles:
   *
   * /
   * /index.html
   * /img/*
   * /manifest.json
   * /sw.js
   * /robots.txt
   * /sitemap.xml
   * /privacy.html
   * /ecommerce.html
   * PDFs
   * etc.
   */
  if (env.ASSETS) {
    const response =
      await env.ASSETS.fetch(
        request,
      );

    /*
     * Static asset was found.
     */
    if (response.status !== 404) {
      return addSecurityHeaders(
        response,
      );
    }
  }

  /*
   * Clean 404 response.
   */
  return addSecurityHeaders(
    new Response(
      `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >
  <meta
    name="robots"
    content="noindex"
  >
  <title>
    Page Not Found | Lawrence Murry
  </title>
  <style>
    :root {
      color-scheme: light dark;
      --primary: #660000;
    }

    * {
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      padding: 2rem;
      font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
      text-align: center;
      background: #f8fafc;
      color: #1f2937;
    }

    main {
      width: min(680px, 100%);
      padding: 3rem 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow:
        0 18px 45px
        rgba(15, 23, 42, .12);
    }

    h1 {
      margin: 0;
      color: var(--primary);
      font-size: 5rem;
      line-height: 1;
    }

    p {
      color: #64748b;
    }

    a {
      display: inline-block;
      margin-top: 1rem;
      padding: .75rem 1.1rem;
      border-radius: .6rem;
      background: var(--primary);
      color: white;
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
      The page you're looking for
      doesn't exist.
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
}

export default {
  async fetch(
    request,
    env,
    ctx,
  ) {
    try {
      return await handleRequest(
        request,
        env,
      );
    } catch (error) {
      console.error(
        "Worker error:",
        error,
      );

      return addSecurityHeaders(
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
