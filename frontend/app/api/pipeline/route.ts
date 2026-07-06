const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/v1/pipeline`, { cache: 'no-store' });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
      return Response.json(
        { detail: error.detail || 'Failed to fetch pipeline runs' },
        { status: res.status }
      );
    }
    
    const data = await res.json();
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Pipeline GET error:', error);
    return Response.json(
      { detail: 'Failed to connect to backend service' },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/api/v1/pipeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
      return Response.json(
        { detail: error.detail || 'Failed to create pipeline run' },
        { status: res.status }
      );
    }
    
    const data = await res.json();
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Pipeline POST error:', error);
    return Response.json(
      { detail: 'Failed to connect to backend service' },
      { status: 503 }
    );
  }
}
