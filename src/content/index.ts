import { detectTechnologies } from '../utils/detector';
import { WebPageMeta } from '../types/recon';

function getPageInformation(): WebPageMeta {
  const url = window.location.href;
  const domain = window.location.hostname;
  const title = document.title || domain;

  // Extract meta description
  let description = '';
  const metaDesc = document.querySelector('meta[name="description"]') ||
                   document.querySelector('meta[property="og:description"]') ||
                   document.querySelector('meta[name="twitter:description"]');
  if (metaDesc) {
    description = metaDesc.getAttribute('content') || '';
  }

  // Detect technologies
  const technologies = detectTechnologies(document);

  return {
    url,
    domain,
    title,
    description: description.trim(),
    technologies,
  };
}

// Cross-browser message listener
const extAPI: any = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

if (extAPI && extAPI.runtime && extAPI.runtime.onMessage) {
  extAPI.runtime.onMessage.addListener((request: any, _sender: any, sendResponse: (res: any) => void) => {
    if (request.action === 'GET_PAGE_DATA') {
      try {
        const pageData = getPageInformation();
        sendResponse({ success: true, data: pageData });
      } catch (err) {
        sendResponse({ success: false, error: String(err) });
      }
    }
    return true; // Keep message channel open for async response
  });
}
