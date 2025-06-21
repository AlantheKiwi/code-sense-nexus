
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { priceId, mode = 'payment', metadata = {} } = await req.json();
    if (!priceId) throw new Error("Price ID is required");
    logStep("Request data received", { priceId, mode, metadata });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create customer with subsidiary metadata
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          subsidiary: 'codesense',
          parent_company: 'insight_ai_systems',
          product_line: 'ai_development_tools',
          source: 'codesense_platform',
        },
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Enhanced metadata with subsidiary tracking
    const enhancedMetadata = {
      user_id: user.id,
      subsidiary: 'codesense',
      parent_company: 'insight_ai_systems',
      product_line: 'ai_development_tools',
      brand: 'CodeSense',
      company_name: 'Insight AI Systems Ltd',
      platform_source: 'codesense_web',
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as 'payment' | 'subscription',
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: enhancedMetadata,
      payment_intent_data: mode === 'payment' ? {
        metadata: enhancedMetadata,
      } : undefined,
      subscription_data: mode === 'subscription' ? {
        metadata: enhancedMetadata,
      } : undefined,
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Record transaction attempt in our system
    await supabaseClient.from("payment_transactions").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      stripe_customer_id: customerId,
      amount_cents: null, // Will be updated on webhook
      status: 'pending',
      metadata: enhancedMetadata,
      created_at: new Date().toISOString(),
    });

    logStep("Transaction recorded in database");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
