const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND}/api/v1/pipeline/${id}`, { cache: 'no-store' });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
      return Response.json(
        { detail: error.detail || `Pipeline run ${id} not found` },
        { status: res.status }
      );
    }
    
    const data = await res.json();
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Pipeline detail GET error:', error);
    return Response.json(
      { detail: 'Failed to connect to backend service' },
      { status: 503 }
    );
  }
}
