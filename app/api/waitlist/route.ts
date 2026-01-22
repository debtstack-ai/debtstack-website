import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Google Sheets API endpoint (using Google Apps Script Web App)
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (!GOOGLE_SCRIPT_URL) {
      // Fallback: log to console in development
      console.log('New waitlist signup:', email, new Date().toISOString());
      return NextResponse.json({
        success: true,
        message: 'Email recorded (dev mode)'
      });
    }

    // Send to Google Sheets via Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        timestamp: new Date().toISOString(),
        source: 'website'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save to Google Sheets');
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined waitlist!'
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}
