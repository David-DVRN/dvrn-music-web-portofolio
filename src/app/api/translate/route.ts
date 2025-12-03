import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Use MyMemory Translation API (Free, no API key needed)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|id`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translation = data.responseData?.translatedText || text;

    // Check if translation is valid (MyMemory sometimes returns the original text)
    if (translation === text || !translation) {
      return NextResponse.json(
        { translation: text, fallback: true },
        { status: 200 }
      );
    }

    return NextResponse.json({ translation });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed", translation: "" },
      { status: 500 }
    );
  }
}