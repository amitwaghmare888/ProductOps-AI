import { BACKEND_URL as BACKEND } from '@/lib/api';

export async function POST(request: Request) {
  const formData = await request.formData();
  const res = await fetch(`${BACKEND}/api/v1/feedback/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
