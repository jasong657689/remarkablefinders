export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/storefront-metrics') {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
      const cache = caches.default;
      const cacheKey = new Request(url.origin + '/api/storefront-metrics', { method: 'GET' });
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
      try {
        const upstream = await fetch('https://resellersproappprivate-production.up.railway.app/api/public/storefront-metrics');
        if (!upstream.ok) throw new Error('Inventory snapshot unavailable');
        const body = await upstream.text();
        const response = new Response(body, {
          headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600, s-maxage=600', 'X-Content-Type-Options': 'nosniff' }
        });
        await cache.put(cacheKey, response.clone());
        return response;
      } catch {
        return new Response(JSON.stringify({ error: 'Inventory snapshot temporarily unavailable' }), {
          status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60' }
        });
      }
    }

    // Old Shopify URLs — return 410 Gone so Google drops them from the index fast.
    // These no longer exist since migrating away from Shopify.
    const gone = [
      /^\/products\//,
      /^\/collections\//,
      /^\/cart/,
      /^\/account/,
      /^\/search/,
      /^\/pages\//,
      /^\/policies\//,
      /^\/tag\//,
      /^\/comments\//,
    ];
    if (request.method === 'GET' && gone.some(r => r.test(url.pathname))) {
      return new Response('This page no longer exists.', {
        status: 410,
        headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' }
      });
    }

    const response = await env.ASSETS.fetch(request);

    if (request.method !== 'GET') return response;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    let html = await response.text();

    html = html
      .replaceAll('https://resellerspro.com/news/post.html?slug=', '/news/post.html?slug=')
      .replaceAll('https://www.resellerspro.com/news/post.html?slug=', '/news/post.html?slug=');

    if (url.pathname === '/' || url.pathname === '/index.html') {
      if (!html.includes('href="/news/"')) {
        html = html.replace(
          '<li><a href="#mission">Why Us</a></li>\n    <li><a href="#contact">Contact</a></li>',
          '<li><a href="#mission">Why Us</a></li>\n    <li><a href="/news/">News</a></li>\n    <li><a href="#contact">Contact</a></li>'
        );
        html = html.replace(
          '<li><a href="https://www.ebay.com/str/remarkablefinders" target="_blank">eBay Store</a></li>\n    <li><a href="#contact">Contact</a></li>',
          '<li><a href="https://www.ebay.com/str/remarkablefinders" target="_blank">eBay Store</a></li>\n    <li><a href="/news/">News</a></li>\n    <li><a href="#contact">Contact</a></li>'
        );
      }
    }

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: { 'content-type': 'text/html; charset=utf-8' }
    });
  }
};
