const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const res = await fetch(`${BACKEND}/api/v1/feedback/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
      return Response.json(
        { detail: error.detail || 'Failed to upload feedback file' },
        { status: res.status }
      );
    }
    
    const data = await res.json();
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Feedback upload error:', error);
    return Response.json(
      { detail: 'Failed to connect to backend service' },
      { status: 503 }
    );
  }
}
