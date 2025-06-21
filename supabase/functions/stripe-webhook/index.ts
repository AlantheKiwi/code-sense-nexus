
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Ensure this is a CodeSense subsidiary transaction
    const metadata = event.data.object.metadata;
    if (metadata?.subsidiary !== 'codesense') {
      logStep("Skipping non-CodeSense transaction", { subsidiary: metadata?.subsidiary });
      return new Response("OK - Not a CodeSense transaction", { status: 200 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Processing successful payment", { 
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          metadata: paymentIntent.metadata 
        });

        // Update payment transaction
        await supabaseClient
          .from("payment_transactions")
          .update({
            status: 'completed',
            amount_cents: paymentIntent.amount,
            stripe_payment_intent_id: paymentIntent.id,
            completed_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', paymentIntent.metadata.session_id);

        // If this is a credit package purchase, add credits
        if (paymentIntent.metadata.package_type === 'credit_package') {
          const creditsAmount = parseInt(paymentIntent.metadata.credits_amount || '0');
          const userId = paymentIntent.metadata.user_id;
          
          if (creditsAmount > 0 && userId) {
            await supabaseClient.from("credit_transactions").insert({
              user_id: userId,
              amount: creditsAmount,
              description: `Credit purchase: ${paymentIntent.metadata.package_id}`,
              balance: 0, // Will be calculated by trigger
              metadata: {
                payment_intent_id: paymentIntent.id,
                package_id: paymentIntent.metadata.package_id,
                subsidiary: 'codesense',
              },
            });
            logStep("Credits added", { userId, credits: creditsAmount });
          }
        }

        // Log subsidiary revenue
        await supabaseClient.from("subsidiary_revenue").insert({
          subsidiary: 'codesense',
          parent_company: 'insight_ai_systems',
          transaction_type: 'credit_purchase',
          amount_cents: paymentIntent.amount,
          currency: paymentIntent.currency,
          stripe_payment_intent_id: paymentIntent.id,
          metadata: paymentIntent.metadata,
          transaction_date: new Date().toISOString(),
        });

        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id });

        await supabaseClient
          .from("payment_transactions")
          .update({
            status: 'session_completed',
            stripe_session_completed_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', session.id);

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription event", { 
          subscriptionId: subscription.id,
          status: subscription.status,
          metadata: subscription.metadata 
        });

        const userId = subscription.metadata.user_id;
        if (userId) {
          await supabaseClient.from("subscribers").upsert({
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            subscribed: subscription.status === 'active',
            subscription_tier: subscription.metadata.subscription_plan || 'pro',
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

          // Log subscription revenue
          await supabaseClient.from("subsidiary_revenue").insert({
            subsidiary: 'codesense',
            parent_company: 'insight_ai_systems',
            transaction_type: 'subscription',
            amount_cents: subscription.items.data[0]?.price.unit_amount || 0,
            currency: subscription.currency,
            stripe_subscription_id: subscription.id,
            metadata: subscription.metadata,
            transaction_date: new Date().toISOString(),
          });
        }

        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(`Webhook Error: ${errorMessage}`, { status: 500 });
  }
});
