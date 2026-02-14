import { NextResponse } from "next/server";
import data from "@/data/clean_data.json";

export function GET() {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=600",
    },
  });
}
