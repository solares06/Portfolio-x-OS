import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Consistency Logs for the current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: consistencyData } = await supabase
      .from('gym_consistency_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .order('date', { ascending: true });

    // 2. Fetch recent workouts/sets
    const { data: setsData } = await supabase
      .from('gym_sets')
      .select('*, gym_exercises(name, target)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // 3. Fetch body metrics history
    const { data: metricsData } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 4. Generate AI Report
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const prompt = `
      You are an expert, encouraging personal trainer AI.
      The user just finished their workout cycle for ${monthName}.
      
      Here is their consistency log (days they went to the gym):
      ${JSON.stringify(consistencyData || [])}
      
      Here are some of their recent logged exercises and sets (kg, reps, rpe):
      ${JSON.stringify(setsData || [])}

      Here is their body metrics trend:
      ${JSON.stringify(metricsData || [])}
      
      Write a highly encouraging, analytical fitness report for this month. 
      Format it in clean HTML (not markdown). Use inline styles for readability.
      Include:
      - A catchy, hype title.
      - A summary of their consistency (how many days they hit out of possible gym days).
      - Analysis of their weights/reps. Highlight any impressive feats or PRs.
      - Body metrics trends if available.
      - A motivational closing statement for next month.
      
      Keep it concise but impactful. Use emojis sparingly for energy.
    `;

    const result = await model.generateContent(prompt);
    const aiReportHtml = result.response.text();

    // 5. Send Email via Resend (use verified email)
    const targetEmail = process.env.CONTACT_TO_EMAIL || user.email || '';
    
    if (process.env.RESEND_API_KEY && targetEmail) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { error: emailError } = await resend.emails.send({
        from: 'AI Trainer <onboarding@resend.dev>',
        to: [targetEmail],
        subject: `🔥 Your ${monthName} Gym Report is Here!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            ${aiReportHtml}
          </div>
        `
      });

      if (emailError) {
        console.error('Resend email error:', emailError);
        // Don't fail the whole request — still return the report
      }
    }

    return NextResponse.json({ success: true, report: aiReportHtml });
  } catch (error: any) {
    console.error('Error generating report:', error);
    
    // Handle Gemini API quota/rate limits
    if (error?.message?.includes('429 Too Many Requests') || error?.message?.includes('Quota exceeded')) {
      return NextResponse.json({ 
        error: 'Your AI request limit has been reached (Free Tier Quota). Please try again later.' 
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate report' 
    }, { status: 500 });
  }
}
