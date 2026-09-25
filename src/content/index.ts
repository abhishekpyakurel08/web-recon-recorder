import { detectTechnologies } from '../utils/detector';
import { WebPageMeta } from '../types/recon';

function getPageInformation(): WebPageMeta {
  const rawUrl = window.location.href;
  const rawDomain = window.location.hostname;
  
  // Truncate title to max 300 chars to avoid storage memory bloat
  const title = (document.title || rawDomain).slice(0, 300);

  // Extract meta description and cap at 1000 chars
  let description = '';
  const metaDesc = document.querySelector('meta[name="description"]') ||
                   document.querySelector('meta[property="og:description"]') ||
                   document.querySelector('meta[name="twitter:description"]');
  if (metaDesc) {
    description = (metaDesc.getAttribute('content') || '').slice(0, 1000);
  }

  // Detect technologies safely
  let technologies: string[] = [];
  try {
    technologies = detectTechnologies(document);
  } catch {
    technologies = [];
  }

  return {
    url: rawUrl,
    domain: rawDomain,
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
