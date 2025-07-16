
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegisterRequest {
  telegram_id: string;
  username?: string;
  referral_code?: string;
  ip_address?: string;
}

interface StartMiningRequest {
  telegram_id: string;
}

interface EndMiningRequest {
  telegram_id: string;
  session_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    console.log(`Processing ${req.method} request for path: ${path}`);

    switch (path) {
      case 'register':
        return await handleRegister(req, supabase);
      case 'start-mining':
        return await handleStartMining(req, supabase);
      case 'end-mining':
        return await handleEndMining(req, supabase);
      case 'balance':
        return await handleGetBalance(req, supabase);
      case 'profile':
        return await handleGetProfile(req, supabase);
      case 'referrals':
        return await handleGetReferrals(req, supabase);
      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          { 
            status: 404, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
    }
  } catch (error) {
    console.error('Error in space-api:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});

async function handleRegister(req: Request, supabase: any) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const body: RegisterRequest = await req.json();
  const { telegram_id, username, referral_code, ip_address } = body;

  if (!telegram_id) {
    return new Response(
      JSON.stringify({ error: 'telegram_id is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('space_users')
    .select('*')
    .eq('telegram_id', telegram_id)
    .single();

  if (existingUser) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User already registered',
        user: existingUser 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Check IP limit if provided
  if (ip_address) {
    const { data: ipCheckResult } = await supabase.rpc('check_ip_registration_limit', {
      ip_addr: ip_address
    });

    if (!ipCheckResult) {
      return new Response(
        JSON.stringify({ error: 'IP address registration limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  }

  // Generate unique referral code
  const { data: newReferralCode } = await supabase.rpc('generate_unique_referral_code');

  // Create new user
  const { data: newUser, error: createError } = await supabase
    .from('space_users')
    .insert({
      telegram_id,
      username,
      referral_code: newReferralCode,
      referred_by_code: referral_code || null,
      ip_address,
      balance: 0
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating user:', createError);
    return new Response(
      JSON.stringify({ error: 'Failed to create user' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Process referral if provided
  if (referral_code) {
    const { data: referralResult } = await supabase.rpc('process_referral', {
      referrer_code_param: referral_code,
      new_user_id: newUser.id
    });

    console.log('Referral processing result:', referralResult);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'User registered successfully',
      user: newUser 
    }),
    { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

async function handleStartMining(req: Request, supabase: any) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const body: StartMiningRequest = await req.json();
  const { telegram_id } = body;

  if (!telegram_id) {
    return new Response(
      JSON.stringify({ error: 'telegram_id is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Get user
  const { data: user, error: userError } = await supabase
    .from('space_users')
    .select('*')
    .eq('telegram_id', telegram_id)
    .single();

  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'User not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Check if user already has an active mining session
  const { data: activeSession } = await supabase
    .from('space_mining_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (activeSession) {
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Mining session already active',
        session: activeSession 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Create new mining session
  const { data: newSession, error: sessionError } = await supabase
    .from('space_mining_sessions')
    .insert({
      user_id: user.id,
      is_active: true
    })
    .select()
    .single();

  if (sessionError) {
    console.error('Error creating mining session:', sessionError);
    return new Response(
      JSON.stringify({ error: 'Failed to start mining session' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Mining session started',
      session: newSession 
    }),
    { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

async function handleEndMining(req: Request, supabase: any) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const body: EndMiningRequest = await req.json();
  const { telegram_id, session_id } = body;

  if (!telegram_id || !session_id) {
    return new Response(
      JSON.stringify({ error: 'telegram_id and session_id are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Get user
  const { data: user, error: userError } = await supabase
    .from('space_users')
    .select('*')
    .eq('telegram_id', telegram_id)
    .single();

  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'User not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Get active mining session
  const { data: session, error: sessionError } = await supabase
    .from('space_mining_sessions')
    .select('*')
    .eq('id', session_id)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (sessionError || !session) {
    return new Response(
      JSON.stringify({ error: 'Active mining session not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Calculate mining duration in minutes
  const startTime = new Date(session.start_time);
  const endTime = new Date();
  const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  // Calculate earnings
  const { data: earnings } = await supabase.rpc('calculate_mining_earnings', {
    session_duration_minutes: durationMinutes
  });

  // Update mining session
  const { error: updateSessionError } = await supabase
    .from('space_mining_sessions')
    .update({
      end_time: endTime.toISOString(),
      earned: earnings,
      is_active: false
    })
    .eq('id', session_id);

  if (updateSessionError) {
    console.error('Error updating mining session:', updateSessionError);
    return new Response(
      JSON.stringify({ error: 'Failed to end mining session' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Update user balance
  const { error: updateBalanceError } = await supabase
    .from('space_users')
    .update({
      balance: user.balance + earnings
    })
    .eq('id', user.id);

  if (updateBalanceError) {
    console.error('Error updating user balance:', updateBalanceError);
    return new Response(
      JSON.stringify({ error: 'Failed to update balance' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Mining session ended',
      earnings,
      duration_minutes: durationMinutes,
      new_balance: user.balance + earnings
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

async function handleGetBalance(req: Request, supabase: any) {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const url = new URL(req.url);
  const telegram_id = url.searchParams.get('telegram_id');

  if (!telegram_id) {
    return new Response(
      JSON.stringify({ error: 'telegram_id parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const { data: user, error } = await supabase
    .from('space_users')
    .select('balance, referral_code')
    .eq('telegram_id', telegram_id)
    .single();

  if (error || !user) {
    return new Response(
      JSON.stringify({ error: 'User not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      balance: user.balance,
      referral_code: user.referral_code
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

async function handleGetProfile(req: Request, supabase: any) {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const url = new URL(req.url);
  const telegram_id = url.searchParams.get('telegram_id');

  if (!telegram_id) {
    return new Response(
      JSON.stringify({ error: 'telegram_id parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const { data: user, error } = await supabase
    .from('space_users')
    .select('*')
    .eq('telegram_id', telegram_id)
    .single();

  if (error || !user) {
    return new Response(
      JSON.stringify({ error: 'User not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Get active mining session if exists
  const { data: activeSession } = await supabase
    .from('space_mining_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  return new Response(
    JSON.stringify({ 
      success: true, 
      user: {
        ...user,
        active_mining_session: activeSession || null
      }
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

async function handleGetReferrals(req: Request, supabase: any) {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const url = new URL(req.url);
  const telegram_id = url.searchParams.get('telegram_id');

  if (!telegram_id) {
    return new Response(
      JSON.stringify({ error: 'telegram_id parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Get user
  const { data: user, error: userError } = await supabase
    .from('space_users')
    .select('*')
    .eq('telegram_id', telegram_id)
    .single();

  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'User not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Get referrals
  const { data: referrals, error: referralsError } = await supabase
    .from('space_referrals')
    .select(`
      *,
      referred:space_users!space_referrals_referred_id_fkey(
        telegram_id,
        username,
        created_at
      )
    `)
    .eq('referrer_code', user.referral_code);

  if (referralsError) {
    console.error('Error fetching referrals:', referralsError);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch referrals' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      referral_code: user.referral_code,
      referrals: referrals || [],
      total_referrals: referrals?.length || 0
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}
