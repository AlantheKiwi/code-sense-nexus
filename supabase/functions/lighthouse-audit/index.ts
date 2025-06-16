
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Lighthouse audit function booting up');

interface AuditRequest {
  url: string;
  device?: 'mobile' | 'desktop';
  categories?: string[];
  projectId?: string;
}

interface LighthouseResult {
  url: string;
  device: string;
  timestamp: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
    totalBlockingTime: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    savings: number;
    displayValue: string;
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    displayValue: string;
  }>;
  fullReport?: any;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const auditRequest: AuditRequest = await req.json();
    
    if (!auditRequest.url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting Lighthouse audit for: ${auditRequest.url}`);
    console.log(`Device: ${auditRequest.device || 'mobile'}`);

    // Validate URL format
    try {
      new URL(auditRequest.url);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Google PageSpeed Insights API for Lighthouse data
    const PAGESPEED_API_KEY = Deno.env.get('PAGESPEED_API_KEY');
    
    if (!PAGESPEED_API_KEY) {
      console.error('PAGESPEED_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'PageSpeed API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const device = auditRequest.device || 'mobile';
    const strategy = device === 'desktop' ? 'desktop' : 'mobile';
    
    const categories = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'];
    const categoryParams = categories.map(c => `category=${c}`).join('&');
    
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(auditRequest.url)}&strategy=${strategy}&key=${PAGESPEED_API_KEY}&${categoryParams}`;

    console.log('Calling PageSpeed API...');
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('PageSpeed API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Failed to run Lighthouse audit',
        details: errorText 
      }), {
        status: apiResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pageSpeedData = await apiResponse.json();
    const lighthouseResult = pageSpeedData.lighthouseResult;

    if (!lighthouseResult) {
      return new Response(JSON.stringify({ error: 'No Lighthouse data returned' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract structured audit results
    const auditResult: LighthouseResult = {
      url: auditRequest.url,
      device: device,
      timestamp: new Date().toISOString(),
      scores: {
        performance: Math.round((lighthouseResult.categories.performance?.score || 0) * 100),
        accessibility: Math.round((lighthouseResult.categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((lighthouseResult.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((lighthouseResult.categories.seo?.score || 0) * 100),
        pwa: Math.round((lighthouseResult.categories.pwa?.score || 0) * 100),
      },
      metrics: {
        firstContentfulPaint: lighthouseResult.audits['first-contentful-paint']?.numericValue || 0,
        largestContentfulPaint: lighthouseResult.audits['largest-contentful-paint']?.numericValue || 0,
        firstInputDelay: lighthouseResult.audits['max-potential-fid']?.numericValue || 0,
        cumulativeLayoutShift: lighthouseResult.audits['cumulative-layout-shift']?.numericValue || 0,
        speedIndex: lighthouseResult.audits['speed-index']?.numericValue || 0,
        totalBlockingTime: lighthouseResult.audits['total-blocking-time']?.numericValue || 0,
      },
      opportunities: extractOpportunities(lighthouseResult.audits),
      diagnostics: extractDiagnostics(lighthouseResult.audits),
      fullReport: lighthouseResult,
    };

    console.log(`Lighthouse audit completed successfully`);
    console.log(`Performance score: ${auditResult.scores.performance}`);

    return new Response(JSON.stringify({ 
      success: true,
      audit: auditResult,
      auditId: pageSpeedData.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in Lighthouse audit function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractOpportunities(audits: any): Array<any> {
  const opportunityAudits = [
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'offscreen-images',
    'render-blocking-resources',
    'unminified-css',
    'unminified-javascript',
    'efficient-animated-content',
    'duplicated-javascript',
    'legacy-javascript',
  ];

  return opportunityAudits
    .map(auditId => {
      const audit = audits[auditId];
      if (!audit || audit.score === 1) return null;

      return {
        id: auditId,
        title: audit.title || '',
        description: audit.description || '',
        savings: audit.details?.overallSavingsMs || 0,
        displayValue: audit.displayValue || '',
      };
    })
    .filter(Boolean);
}

function extractDiagnostics(audits: any): Array<any> {
  const diagnosticAudits = [
    'mainthread-work-breakdown',
    'bootup-time',
    'uses-long-cache-ttl',
    'total-byte-weight',
    'dom-size',
    'critical-request-chains',
    'user-timings',
    'diagnostics',
  ];

  return diagnosticAudits
    .map(auditId => {
      const audit = audits[auditId];
      if (!audit) return null;

      return {
        id: auditId,
        title: audit.title || '',
        description: audit.description || '',
        score: audit.score || 0,
        displayValue: audit.displayValue || '',
      };
    })
    .filter(Boolean);
}
