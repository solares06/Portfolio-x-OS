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

    // 1. Fetch Consistency Logs
    const { data: consistencyData } = await supabase
      .from('gym_consistency_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('date', { ascending: true });

    // 2. Fetch recent workouts/sets
    const { data: setsData } = await supabase
      .from('gym_sets')
      .select('*, gym_workout_days(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50); // Get recent sets

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not set' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 3. Generate AI Report
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are an expert, encouraging personal trainer AI.
      The user just finished a 4-week workout cycle.
      
      Here is their consistency log for the cycle:
      ${JSON.stringify(consistencyData)}
      
      Here are some of their recent logged exercises and sets (kg, reps, rpe):
      ${JSON.stringify(setsData)}
      
      Write a highly encouraging, analytical fitness report for this month. 
      Format it in beautiful Markdown. 
      Include:
      - A catchy, hype subject line/title.
      - A summary of their consistency (how many days they hit).
      - Analysis of their weights/reps. Highlight any impressive feats.
      - A motivational closing statement for the next 4-week cycle.
    `;

    const result = await model.generateContent(prompt);
    const aiReportMarkdown = result.response.text();

    // Convert simple markdown to HTML for email
    const aiReportHtml = aiReportMarkdown
      .replace(/\\n/g, '<br>')
      .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/#(.*)/g, '<h2>$1</h2>');

    // 4. Send Email
    // Using user.email or a fallback test email
    const targetEmail = user.email || 'test@example.com'; 

    await resend.emails.send({
      from: 'AI Trainer <onboarding@resend.dev>',
      to: [targetEmail],
      subject: '🔥 Your 4-Week Gym Cycle Report is Here!',
      html: `
        <div style="font-family: sans-serif; color: #111;">
          ${aiReportHtml}
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
