import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      status: 'success',
      patient_id: body.patient_id,
      action: body.action,
      updated_at: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
