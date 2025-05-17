// This would be deployed as a Supabase Edge Function

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    const { players, subject, message, fixtureId } = await req.json()
    
    // Using Resend API directly with fetch
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
    const RESEND_API_URL = 'https://api.resend.com/emails'
    
    for (const player of players) {
      // Send email using Resend
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: Deno.env.get('EMAIL_FROM') || 'team@theboardfc.com',
          to: player.email,
          subject: subject,
          text: `Hello ${player.first_name},\n\n${message}\n\nRegards,\nThe Board FC Team`
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error(`Failed to send email to ${player.email}:`, errorData)
        continue // Continue with next player even if one fails
      }
      
      // Log email sent in database
      await supabaseClient
        .from('notification_logs')
        .insert({
          player_id: player.id,
          fixture_id: fixtureId,
          notification_type: 'email',
          subject,
          sent_at: new Date().toISOString(),
        })
    }
    
    return new Response(
      JSON.stringify({ success: true, message: `Sent notifications to ${players.length} players` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 