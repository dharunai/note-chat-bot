import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchCrossrefByDOI(doi: string) {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.message ?? null;
}

async function fetchCrossrefByQuery(query: string) {
  const url = `https://api.crossref.org/works?rows=1&query.bibliographic=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.message?.items?.[0] ?? null;
}

function formatAuthors(authors: any[] | undefined, style: 'apa'|'mla'|'chicago') {
  if (!authors || authors.length === 0) return '';
  const names = authors.map((a) => ({ given: a.given || '', family: a.family || '' }));
  if (style === 'apa') {
    // APA: Last, F. M., & Last, F. M.
    return names
      .map((n) => `${n.family}${n.given ? `, ${n.given.split(/[-\s]/).map((p: string) => p[0]).filter(Boolean).join('.')}.` : ''}`)
      .join(', ')
      .replace(/, ([^,]*)$/, ', & $1');
  }
  if (style === 'mla') {
    // MLA: Last, First, and First Last
    if (names.length === 1) return `${names[0].family}, ${names[0].given}`.trim();
    const first = `${names[0].family}, ${names[0].given}`.trim();
    const rest = names.slice(1).map((n) => `${n.given} ${n.family}`.trim());
    return `${first}, and ${rest.join(', ')}`;
  }
  // Chicago similar to MLA author list
  if (names.length === 1) return `${names[0].given} ${names[0].family}`.trim();
  const last = names.pop();
  return `${names.map((n) => `${n.given} ${n.family}`).join(', ')}, and ${last?.given} ${last?.family}`;
}

function getYear(issued: any): string {
  const y = issued?.['date-parts']?.[0]?.[0];
  return y ? String(y) : '';
}

function toAPA(item: any) {
  const authors = formatAuthors(item.author, 'apa');
  const year = getYear(item.issued);
  const title = (item.title?.[0] || '').replace(/\.$/, '');
  const journal = item['container-title']?.[0] || '';
  const volume = item.volume ? `${item.volume}` : '';
  const issue = item.issue ? `(${item.issue})` : '';
  const pages = item.page ? `, ${item.page}` : '';
  const doi = item.DOI ? `https://doi.org/${item.DOI}` : (item.URL || '');
  const volIssue = [volume, issue].filter(Boolean).join('');
  const afterTitle = journal ? ` ${journal}, ${volIssue}${pages}.` : '';
  return `${authors} (${year}). ${title}.${afterTitle} ${doi}`.trim();
}

function toMLA(item: any) {
  const authors = formatAuthors(item.author, 'mla');
  const year = getYear(item.issued);
  const title = (item.title?.[0] || '').replace(/\.$/, '');
  const journal = item['container-title']?.[0] || '';
  const volume = item.volume ? `vol. ${item.volume}` : '';
  const issue = item.issue ? `no. ${item.issue}` : '';
  const pages = item.page ? `pp. ${item.page}` : '';
  const parts = [authors, `"${title}."`, journal, volume, issue, year, pages].filter(Boolean).join(', ');
  const doi = item.DOI ? ` https://doi.org/${item.DOI}` : (item.URL ? ` ${item.URL}` : '');
  return `${parts}.${doi}`.trim();
}

function toChicago(item: any) {
  const authors = formatAuthors(item.author, 'chicago');
  const year = getYear(item.issued);
  const title = (item.title?.[0] || '').replace(/\.$/, '');
  const journal = item['container-title']?.[0] || '';
  const volume = item.volume ? `${item.volume}` : '';
  const issue = item.issue ? `, no. ${item.issue}` : '';
  const pages = item.page ? `: ${item.page}` : '';
  const doi = item.DOI ? `https://doi.org/${item.DOI}` : (item.URL || '');
  const j = journal ? ` ${journal} ${volume}${issue} (${year})${pages}.` : ` (${year}).`;
  return `${authors}. "${title}."${j} ${doi}`.trim();
}

function isDOI(str: string) {
  return /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i.test(str);
}

function extractDOI(str: string) {
  const m = str.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  return m ? m[0] : '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { query = '', style = 'all' } = await req.json();
    const q = String(query).trim();
    if (!q) throw new Error('Missing query');

    let item = null;
    if (isDOI(q)) {
      item = await fetchCrossrefByDOI(extractDOI(q));
    } else {
      item = await fetchCrossrefByQuery(q);
    }
    if (!item) return new Response(JSON.stringify({ error: 'No record found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const apa = toAPA(item);
    const mla = toMLA(item);
    const chicago = toChicago(item);

    const payload = style === 'apa' ? { apa } : style === 'mla' ? { mla } : style === 'chicago' ? { chicago } : { apa, mla, chicago };

    return new Response(JSON.stringify(payload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
