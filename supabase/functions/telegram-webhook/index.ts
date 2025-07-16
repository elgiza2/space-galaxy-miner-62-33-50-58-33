
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

  try {
    if (req.method === 'GET') {
      // Setup webhook
      const webhookUrl = `https://gisvsmavwxvdfwkamcxs.supabase.co/functions/v1/telegram-webhook`;
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      });
      
      const data = await response.json();
      
      return new Response(JSON.stringify({
        configured: data.ok,
        webhook_url: webhookUrl,
        response: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST') {
      const update = await req.json();
      console.log('Received webhook update:', JSON.stringify(update, null, 2));

      // Handle successful payment
      if (update.pre_checkout_query) {
        const preCheckoutQuery = update.pre_checkout_query;
        
        // Answer pre-checkout query (approve payment)
        await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pre_checkout_query_id: preCheckoutQuery.id,
            ok: true
          })
        });

        console.log('Pre-checkout query approved for charge:', preCheckoutQuery.invoice_payload);
      }

      // Handle successful payment completion
      if (update.message?.successful_payment) {
        const payment = update.message.successful_payment;
        const chargeId = payment.invoice_payload;
        const telegramChargeId = payment.telegram_payment_charge_id;
        const providerChargeId = payment.provider_payment_charge_id;

        console.log('Processing successful payment:', {
          charge_id: chargeId,
          telegram_charge_id: telegramChargeId,
          provider_charge_id: providerChargeId,
          total_amount: payment.total_amount,
          currency: payment.currency
        });

        // Update transaction status to completed
        const { error: updateError } = await supabase
          .from('telegram_stars_transactions')
          .update({ 
            status: 'completed',
            provider_payment_charge_id: providerChargeId || telegramChargeId,
            updated_at: new Date().toISOString()
          })
          .eq('telegram_payment_charge_id', chargeId);

        if (updateError) {
          console.error('Error updating transaction:', updateError);
        } else {
          console.log('Transaction updated successfully for charge:', chargeId);
        }

        // Send confirmation message to user
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: update.message.chat.id,
            text: `✅ Payment successful! Thank you for your purchase.\n\nTransaction ID: ${chargeId.slice(0, 12)}...`
          })
        });
      }

      // Handle /start command with referral
      if (update.message?.text?.startsWith('/start')) {
        const telegram_user = update.message.from;
        const referral_code = update.message.text.split(' ')[1];

        // Store webhook event
        await supabase.from('telegram_webhook_events').insert({
          update_id: update.update_id,
          event_type: 'start_command',
          user_data: telegram_user,
          referral_code: referral_code || null
        });

        console.log('Start command processed for user:', telegram_user.id);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
