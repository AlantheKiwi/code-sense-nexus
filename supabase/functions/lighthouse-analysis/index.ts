
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Lighthouse analysis function booting up.')

const PAGESPEED_API_KEY = Deno.env.get('PAGESPEED_API_KEY')
const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!PAGESPEED_API_KEY) {
    console.error('PAGESPEED_API_KEY is not set in environment variables.')
    return new Response(JSON.stringify({ error: 'PageSpeed API key is not configured.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  try {
    const { url, device = 'mobile' } = await req.json()

    if (!url) {
        return new Response(JSON.stringify({ error: 'URL parameter is required to run an audit.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    const categories = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa']
    const categoryParams = categories.map(c => `category=${c}`).join('&')
    const apiResponse = await fetch(`${PAGESPEED_API_URL}?url=${encodeURIComponent(url)}&strategy=${device}&key=${PAGESPEED_API_KEY}&${categoryParams}`)
    
    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text()
        console.error('PageSpeed API error:', errorBody)
        return new Response(JSON.stringify({ error: 'Failed to communicate with Google PageSpeed API.', details: errorBody }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: apiResponse.status,
        })
    }

    const results = await apiResponse.json()
    
    const { lighthouseResult } = results;
    const { scores: categoryScores } = lighthouseResult;
    
    const scores = {
      performance: categoryScores.performance * 100,
      accessibility: categoryScores.accessibility * 100,
      bestPractices: categoryScores['best-practices'] * 100,
      seo: categoryScores.seo * 100,
      pwa: categoryScores.pwa * 100,
    };

    return new Response(JSON.stringify({ scores, fullReportId: results.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (e) {
    console.error('Error in lighthouse-analysis function:', e)
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
