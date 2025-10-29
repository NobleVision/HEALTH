import { OpenAI } from 'openai';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Fetch recent metrics
    const result = await query(
      `SELECT metric_type, value, unit, composite_data, timestamp
       FROM health_metrics
       WHERE user_id = $1 AND timestamp > NOW() - INTERVAL '30 days'
       ORDER BY timestamp DESC
       LIMIT 100`,
      [userId]
    );

    const metrics = result.rows;

    if (metrics.length === 0) {
      return NextResponse.json({
        insights: 'No health data available yet. Start tracking your health metrics to get personalized insights.',
        recommendations: [],
        anomalies: [],
      });
    }

    // Format metrics for AI analysis
    const metricsText = metrics
      .map((m) => `${m.metric_type}: ${m.value} ${m.unit || ''} (${new Date(m.timestamp).toLocaleDateString()})`)
      .join('\n');

    const prompt = `You are a health insights AI assistant. Analyze the following health metrics and provide:
1. Key insights about the person's health trends
2. 3-5 personalized recommendations for improvement
3. Any concerning trends or anomalies that should be flagged

Health Metrics (last 30 days):
${metricsText}

Provide your response in JSON format with keys: "insights", "recommendations" (array), "anomalies" (array).`;

    const message = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.choices[0].message.content || '';

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const aiResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { insights: responseText, recommendations: [], anomalies: [] };

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

