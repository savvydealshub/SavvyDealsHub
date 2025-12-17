import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Ingest disabled for initial launch" },
    { status: 200 }
  );
}
