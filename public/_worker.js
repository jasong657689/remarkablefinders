export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    if (request.method !== 'GET') return response;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    if (url.pathname !== '/' && url.pathname !== '/index.html') return response;

    let html = await response.text();

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

    if (!html.includes('id="news"')) {
      const newsSection = `\n<!-- NEWS -->\n<section class="rf-sec rf-news" id="news">\n  <div style="text-align:center;margin-bottom:3rem;">\n    <div class="rf-tag" style="justify-content:center;">Latest Articles</div>\n    <h2 class="rf-h" style="text-align:center;">News &amp; <span>Reseller Tips</span></h2>\n    <p class="rf-p" style="margin:0 auto;">Sourcing lessons, eBay selling tips, inventory ideas, and updates from Remarkable Finders and Reseller's Pro.</p>\n  </div>\n  <div class="rf-why-grid">\n    <div class="rf-why-card"><div class="rf-why-title">How to Find Dead Inventory Before It Costs You Thousands</div><p class="rf-why-text">Dead inventory quietly drains cash, storage space, and profit. Learn how to identify aging listings and recover trapped money.</p><p style="margin-top:1rem;"><a href="https://resellerspro.com/news/post.html?slug=how-to-find-dead-inventory-before-it-costs-you-thousands" style="color:var(--red);font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Read Article →</a></p></div>\n    <div class="rf-why-card"><div class="rf-why-title">Welcome to Reseller's Pro News</div><p class="rf-why-text">Official product updates, reseller tips, feature announcements, and growth strategies for online sellers.</p><p style="margin-top:1rem;"><a href="https://resellerspro.com/news/post.html?slug=welcome-to-resellers-pro-news" style="color:var(--red);font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Read Article →</a></p></div>\n    <div class="rf-why-card"><div class="rf-why-title">View All RemarkableFinders News</div><p class="rf-why-text">Browse the newest reseller stories, eBay selling lessons, and Remarkable Finders updates.</p><p style="margin-top:1rem;"><a href="/news/" style="color:var(--red);font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Open News Center →</a></p></div>\n    <div class="rf-why-card"><div class="rf-why-title">Built By A Reseller</div><p class="rf-why-text">Remarkable Finders is the store. Reseller's Pro is the system behind the business.</p><p style="margin-top:1rem;"><a href="https://resellerspro.com/" style="color:var(--red);font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Learn More →</a></p></div>\n  </div>\n</section>\n`;
      html = html.replace('<!-- STORY -->', newsSection + '\n<!-- STORY -->');
    }

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: { 'content-type': 'text/html; charset=utf-8' }
    });
  }
};
