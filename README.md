# Lawrence Murry — Proposal Expert

Professional portfolio and resume website for Lawrence Murry,
Senior Proposal Manager and Enterprise B2B SaaS Proposal Professional.

## Website

https://lawrencemurry.com

## Purpose

The site presents Lawrence Murry's:

- Proposal management experience
- Enterprise and SaaS proposal expertise
- Government and federal RFP experience
- CF APMP certification
- Professional development
- Resume and supporting materials
- Testimonials
- Selected web projects
- Teams Stay Green eBook

## Technology

- HTML5
- CSS / Tailwind CSS
- JavaScript
- Cloudflare Pages
- Cloudflare Pages Functions
- Google Analytics
- JSON-LD structured data
- XML sitemap
- robots.txt
- PWA/service-worker functionality

## Repository Structure

functions/          Cloudflare Pages Functions
js/                 Client-side JavaScript
img/                Images and certificates
index.html          Main website
testimonials.html   Testimonials
privacy.html        Privacy policy
success.html        Payment success page
teamsstaygreen.html eBook sales page
manifest.json       PWA manifest
sw.js               Service worker
sitemap.xml         XML sitemap
robots.txt          Search-engine directives
_headers            HTTP security headers
_redirects          Redirect rules
wrangler.toml       Cloudflare configuration
Proposal-Manager-Resume-Lawrence-Murry.pdf
docs/               Project documentation

## Deployment

The production deployment target is Cloudflare Pages.

See:

- docs/DEPLOYMENT.md
- docs/SEO-CHECKLIST.md

## SEO

The site includes:

- Canonical URLs
- Open Graph metadata
- Twitter metadata
- JSON-LD structured data
- Sitemap
- robots.txt
- Responsive/mobile-first design
- Semantic HTML
- Image alt text

## Security

Production administrative and diagnostic endpoints must not be publicly
accessible.

Visitor analytics containing IP addresses, location data, request headers,
or other potentially sensitive information must be protected by
authentication/access controls.

## Development

Make changes in a feature branch and verify:

- Main page loads correctly
- Navigation works
- Forms work
- Cloudflare Functions respond correctly
- Payment flow works
- Sitemap and robots.txt remain valid
- No test/admin pages are publicly indexable

## License

[Add the appropriate license or state that this repository is not licensed
for redistribution.]