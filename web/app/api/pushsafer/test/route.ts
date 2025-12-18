import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/server/pushsafer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Test endpoint to verify Pushsafer configuration
 * GET /api/pushsafer/test
 */
export async function GET(request: NextRequest) {
  try {
    const success = await sendPushNotification({
      t: '✅ NomNom Test',
      m: 'Push notification đang hoạt động! Your Pushsafer integration is working correctly.',
      i: 33, // Check icon
      c: '#51CF66', // Green
      pr: 0, // Normal priority
    });

    if (success) {
      return NextResponse.json({
        ok: true,
        message: 'Test notification sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test notification. Check API key and server logs.' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Get current Pushsafer configuration status
 * POST /api/pushsafer/test with body { type: 'cat-begging' | 'auto-feed' | 'low-food' | 'environment' }
 */
export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const type = String(payload.type || 'default');

  try {
    let success = false;

    switch (type) {
      case 'cat-begging':
        const { notifyCatBegging } = await import('@/lib/server/pushsafer');
        success = await notifyCatBegging();
        break;

      case 'auto-feed':
        const { notifyAutoFeed } = await import('@/lib/server/pushsafer');
        success = await notifyAutoFeed(50); // Test with 50g
        break;

      case 'low-food':
        const { notifyLowFood } = await import('@/lib/server/pushsafer');
        success = await notifyLowFood(180, 15); // Test with 15%
        break;

      case 'environment':
        const { notifyAbnormalEnvironment } = await import('@/lib/server/pushsafer');
        success = await notifyAbnormalEnvironment(32, 85, 'both');
        break;

      default:
        success = await sendPushNotification({
          t: '✅ NomNom Test',
          m: `Test notification (type: ${type})`,
          i: 33,
          c: '#51CF66',
          pr: 0,
        });
    }

    if (success) {
      return NextResponse.json({
        ok: true,
        message: `Test notification sent successfully (type: ${type})`,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test notification. Check API key and server logs.' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
