import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  if (action === 'pipeline') {
    try {
      console.log(`[Proxy] Triggering AI pipeline at: ${backendUrl}/api/v1/run-pipeline`);
      const res = await fetch(`${backendUrl}/api/v1/run-pipeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch (e: any) {
      console.error("[Proxy] Error triggering pipeline:", e);
      return NextResponse.json({ status: "error", message: `FastAPI server unreachable: ${e.message}` }, { status: 502 });
    }
  }

  if (action === 'csv') {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ status: "error", message: "No CSV file provided." }, { status: 400 });
      }

      console.log(`[Proxy] Uploading CSV to: ${backendUrl}/api/v1/upload-csv`);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file, file.name);

      const res = await fetch(`${backendUrl}/api/v1/upload-csv`, {
        method: "POST",
        body: uploadFormData
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch (e: any) {
      console.error("[Proxy] Error uploading CSV:", e);
      return NextResponse.json({ status: "error", message: `FastAPI server unreachable: ${e.message}` }, { status: 502 });
    }
  }

  return NextResponse.json({ status: "error", message: "Invalid action." }, { status: 400 });
}
