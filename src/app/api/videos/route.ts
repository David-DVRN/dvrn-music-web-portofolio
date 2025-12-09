import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!;
const UPLOADS_PLAYLIST_ID = "UUy4yQVU_kWnGFktKFYMWYKQ"; // Ganti 'UC' jadi 'UU'
const MAX_RESULTS = 50;

interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubeSnippet {
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
  };
  resourceId: {
    videoId: string;
  };
}

interface YouTubePlaylistItem {
  snippet: YouTubeSnippet;
}

interface YouTubeAPIResponse {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

export async function GET() {
  try {
    let videos: Video[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      url.searchParams.append("part", "snippet");
      url.searchParams.append("playlistId", UPLOADS_PLAYLIST_ID);
      url.searchParams.append("maxResults", MAX_RESULTS.toString());
      url.searchParams.append("key", API_KEY);
      if (nextPageToken) url.searchParams.append("pageToken", nextPageToken);

      const res = await fetch(url.toString());

      if (!res.ok) {
        throw new Error(`YouTube API error: ${res.statusText}`);
      }

      const data: YouTubeAPIResponse = await res.json();

      const newVideos = data.items.map((item): Video => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
      }));

      videos = [...videos, ...newVideos];
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}