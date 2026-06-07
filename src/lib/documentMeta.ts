import { translations, type Locale } from '../i18n/translations';

export const SITE_URL = 'https://worldcup2026.arhan-konuksal.dev';
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setAlternateLink(hreflang: string, href: string) {
  const id = `wc-hreflang-${hreflang}`;
  let el = document.getElementById(id) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.id = id;
    el.setAttribute('rel', 'alternate');
    document.head.appendChild(el);
  }
  el.setAttribute('hreflang', hreflang);
  el.setAttribute('href', href);
}

export function updateDocumentMeta(locale: Locale) {
  const copy = translations[locale];

  document.title = copy.seoTitle;
  document.documentElement.lang = locale;

  setMeta('description', copy.seoDescription);
  setMeta('keywords', copy.seoKeywords);
  setMeta('author', copy.footer);
  setMeta('robots', 'index, follow');

  setMeta('og:title', copy.seoTitle, 'property');
  setMeta('og:description', copy.seoDescription, 'property');
  setMeta('og:type', 'website', 'property');
  setMeta('og:url', SITE_URL, 'property');
  setMeta('og:locale', locale === 'tr' ? 'tr_TR' : 'en_US', 'property');
  setMeta(
    'og:locale:alternate',
    locale === 'tr' ? 'en_US' : 'tr_TR',
    'property',
  );
  setMeta('og:site_name', copy.eyebrow, 'property');
  setMeta('og:image', OG_IMAGE_URL, 'property');
  setMeta('og:image:width', '1200', 'property');
  setMeta('og:image:height', '630', 'property');
  setMeta('og:image:alt', copy.seoDescription, 'property');

  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', copy.seoTitle);
  setMeta('twitter:description', copy.seoDescription);
  setMeta('twitter:image', OG_IMAGE_URL);

  setCanonical(SITE_URL);
  setAlternateLink('tr', SITE_URL);
  setAlternateLink('en', SITE_URL);
  setAlternateLink('x-default', SITE_URL);

  let jsonLd = document.getElementById('wc-jsonld') as HTMLScriptElement | null;
  if (!jsonLd) {
    jsonLd = document.createElement('script');
    jsonLd.id = 'wc-jsonld';
    jsonLd.type = 'application/ld+json';
    document.head.appendChild(jsonLd);
  }

  jsonLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: copy.seoTitle,
    description: copy.seoDescription,
    url: SITE_URL,
    image: OG_IMAGE_URL,
    inLanguage: locale === 'tr' ? 'tr' : 'en',
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: copy.footer },
  });
}
