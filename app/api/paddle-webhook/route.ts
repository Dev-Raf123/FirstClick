import { NextResponse } from 'next/server';

// Paddle webhook removed - return 410 to indicate the endpoint is no longer available.
export async function POST() {
  return NextResponse.json({ error: 'Paddle webhook removed' }, { status: 410 });
}
