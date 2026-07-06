const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/v1/evaluate`, { cache: 'no-store' });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
      return Response.json(
        { detail: error.detail || 'Failed to fetch evaluation history' },
        { status: res.status }
      );
    }
    
    const data = await res.json();
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Evaluate GET error:', error);
    return Response.json(
      { detail: 'Failed to connect to backend service' },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/api/v1/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
      return Response.json(
        { detail: error.detail || 'Failed to run evaluation' },
        { status: res.status }
      );
    }
    
    const data = await res.json();
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Evaluate POST error:', error);
    return Response.json(
      { detail: 'Failed to connect to backend service' },
      { status: 503 }
    );
  }
}
