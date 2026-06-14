import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      received: true,
      message:
        "PayFast ITN endpoint placeholder. Full payment verification comes next.",
    },
    { status: 202 },
  );
}
