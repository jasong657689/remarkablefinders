(() => {
  const form = document.getElementById('rf-search-form');
  const input = document.getElementById('rf-search-input');
  const status = document.getElementById('rf-search-status');
  const results = document.getElementById('rf-search-results');
  const more = document.getElementById('rf-search-more');
  let query = '', cursor = null, controller = null, generation = 0;
  const money = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' });
  async function search(append) {
    if (!append) {
      query = input.value.trim();
      if (query.length < 2) { status.textContent = 'Enter at least 2 characters to search.'; input.focus(); return; }
      controller?.abort(); generation++; cursor = null; results.replaceChildren();
    }
    const version = generation;
    controller = new AbortController();
    form.querySelector('button').disabled = true; more.hidden = true;
    status.textContent = 'Searching our eBay inventory…';
    const params = new URLSearchParams({ q:query });
    if (append && cursor) params.set('after', cursor);
    try {
      const response = await fetch('https://resellersproappprivate-production.up.railway.app/api/public/ebay-search?' + params, { signal:controller.signal, credentials:'omit' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Search unavailable.');
      if (version !== generation) return;
      for (const item of data.items) {
        const row = document.createElement('article'); row.className = 'rf-search-result';
        const detail = document.createElement('div');
        const title = document.createElement('h3'); title.textContent = item.title;
        const price = document.createElement('p'); price.textContent = (item.priceCents === null ? 'See price on eBay' : money.format(item.priceCents/100)) + ' · ' + item.quantity + ' available';
        detail.append(title,price);
        const link = document.createElement('a'); link.className='btn-w'; link.href='https://www.ebay.com/itm/'+item.listingId; link.target='_blank'; link.rel='noopener noreferrer'; link.textContent='View on eBay';
        row.append(detail,link); results.append(row);
      }
      cursor = data.nextCursor; more.hidden = !cursor;
      status.textContent = results.children.length ? 'Showing '+results.children.length+' matching listings for “'+query+'”. Availability and prices reflect our latest inventory import; confirm on eBay.' : 'No matching listings in our latest eBay inventory import. Try a player, set, year, or different item name.';
    } catch(error) {
      if(error.name !== 'AbortError' && version === generation) { status.textContent=error.message; more.hidden=!(append && cursor); }
    } finally { if(version === generation) form.querySelector('button').disabled=false; }
  }
  form.addEventListener('submit',event=>{event.preventDefault();search(false);});
  more.addEventListener('click',()=>search(true));
})();
