/**
 * Technology detector signatures and evaluation rules.
 * This runs within the context script or DOM inspector context.
 */

export interface TechRule {
  name: string;
  category: 'Frontend Framework' | 'Meta Framework' | 'CMS' | 'CSS Framework' | 'Library' | 'E-commerce' | 'Analytics' | 'Infrastructure';
  match: (doc: Document) => boolean;
}

export const TECH_RULES: TechRule[] = [
  {
    name: 'Next.js',
    category: 'Meta Framework',
    match: (doc) => {
      return !!doc.getElementById('__NEXT_DATA__') || 
             !!doc.querySelector('script[src*="/_next/"]') || 
             !!doc.querySelector('meta[name="next-head-count"]');
    }
  },
  {
    name: 'Vercel',
    category: 'Infrastructure',
    match: (doc) => {
      return !!doc.querySelector('script[src*="vercel"]') ||
             !!doc.querySelector('link[href*="vercel"]') ||
             !!doc.querySelector('[data-vercel-edit-info]') ||
             Array.from(doc.querySelectorAll<HTMLScriptElement>('script')).some(s => 
               (s.src && s.src.includes('vercel')) ||
               (s.textContent && s.textContent.includes('vercel'))
             );
    }
  },
  {
    name: 'React',
    category: 'Frontend Framework',
    match: (doc) => {
      return !!doc.querySelector('[data-reactroot]') ||
             !!doc.querySelector('[data-reactid]') ||
             Array.from(doc.querySelectorAll<HTMLScriptElement>('script')).some(s => 
               (s.src && s.src.includes('react')) || 
               (s.textContent && s.textContent.includes('React.createElement'))
             );
    }
  },
  {
    name: 'Vue.js',
    category: 'Frontend Framework',
    match: (doc) => {
      return Array.from(doc.querySelectorAll('*')).some(el => {
        return Array.from(el.attributes).some(attr => attr.name.startsWith('data-v-') || attr.name.startsWith('v-'));
      }) || Array.from(doc.querySelectorAll<HTMLScriptElement>('script')).some(s => s.src && (s.src.includes('vue.js') || s.src.includes('vue.min.js')));
    }
  },
  {
    name: 'Nuxt.js',
    category: 'Meta Framework',
    match: (doc) => {
      return !!doc.getElementById('__NUXT__') ||
             !!doc.querySelector('script[src*="/_nuxt/"]');
    }
  },
  {
    name: 'WordPress',
    category: 'CMS',
    match: (doc) => {
      const generator = doc.querySelector('meta[name="generator"]')?.getAttribute('content');
      return (generator && generator.toLowerCase().includes('wordpress')) ||
             !!doc.querySelector('link[href*="wp-content"]') ||
             !!doc.querySelector('script[src*="wp-includes"]');
    }
  },
  {
    name: 'Tailwind CSS',
    category: 'CSS Framework',
    match: (doc) => {
      return Array.from(doc.styleSheets || []).some(ss => {
        try {
          return Array.from(ss.cssRules || []).some(rule => rule.cssText.includes('--tw-') || rule.cssText.includes('tailwind'));
        } catch {
          return false;
        }
      }) || Array.from(doc.querySelectorAll<HTMLScriptElement>('script')).some(s => s.src && s.src.includes('tailwindcss'));
    }
  },
  {
    name: 'Bootstrap',
    category: 'CSS Framework',
    match: (doc) => {
      return Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).some(l => l.href && l.href.includes('bootstrap')) ||
             Array.from(doc.querySelectorAll<HTMLScriptElement>('script')).some(s => s.src && s.src.includes('bootstrap'));
    }
  },
  {
    name: 'jQuery',
    category: 'Library',
    match: (doc) => {
      return Array.from(doc.querySelectorAll<HTMLScriptElement>('script')).some(s => s.src && s.src.includes('jquery'));
    }
  },
  {
    name: 'Shopify',
    category: 'E-commerce',
    match: (doc) => {
      return Array.from(doc.querySelectorAll<HTMLScriptElement>('script')).some(s => s.src && s.src.includes('cdn.shopify.com')) ||
             !!doc.querySelector('link[href*="cdn.shopify.com"]');
    }
  },
  {
    name: 'Angular',
    category: 'Frontend Framework',
    match: (doc) => {
      return !!doc.querySelector('[ng-version]') ||
             !!doc.querySelector('[ng-app]') ||
             Array.from(doc.querySelectorAll<HTMLScriptElement>('script')).some(s => s.src && s.src.includes('angular'));
    }
  },
  {
    name: 'Svelte',
    category: 'Frontend Framework',
    match: (doc) => {
      return Array.from(doc.querySelectorAll('*')).some(el => Array.from(el.classList).some(c => c.startsWith('svelte-')));
    }
  },
  {
    name: 'Vite',
    category: 'Infrastructure',
    match: (doc) => {
      return !!doc.querySelector('script[src*="/@vite/"]') ||
             Array.from(doc.querySelectorAll<HTMLScriptElement>('script')).some(s => s.src && s.src.includes('vite'));
    }
  },
  {
    name: 'Google Analytics',
    category: 'Analytics',
    match: (doc) => {
      return Array.from(doc.querySelectorAll<HTMLScriptElement>('script')).some(s => 
        s.src && (s.src.includes('googletagmanager.com') || s.src.includes('google-analytics.com'))
      );
    }
  },
  {
    name: 'Font Awesome',
    category: 'Library',
    match: (doc) => {
      return Array.from(doc.querySelectorAll<HTMLLinkElement>('link')).some(l => l.href && (l.href.includes('fontawesome') || l.href.includes('font-awesome'))) ||
             Array.from(doc.querySelectorAll<HTMLScriptElement>('script')).some(s => s.src && s.src.includes('fontawesome'));
    }
  }
];

export function detectTechnologies(doc: Document): string[] {
  const detected: string[] = [];
  
  for (const rule of TECH_RULES) {
    try {
      if (rule.match(doc)) {
        detected.push(rule.name);
      }
    } catch {
      // Ignore cross-origin stylesheet access errors or DOM errors
    }
  }
  
  return Array.from(new Set(detected));
}
