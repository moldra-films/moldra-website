import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Pluggy credentials not configured in environmental variables" }, { status: 400 });
  }

  try {
    // 1. Authenticate with Pluggy to get API Key
    const authRes = await fetch("https://api.pluggy.ai/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      return NextResponse.json({ error: `Auth failed: ${errText}` }, { status: 500 });
    }

    const { apiKey } = await authRes.json();

    // 2. Create Connect Token
    const tokenRes = await fetch("https://api.pluggy.ai/connect_token", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-API-KEY": apiKey
      },
      body: JSON.stringify({
        options: {
          clientUserId: "moldra-admin"
        }
      })
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return NextResponse.json({ error: `Token generation failed: ${errText}` }, { status: 500 });
    }

    const { accessToken } = await tokenRes.json();

    return NextResponse.json({ accessToken });
  } catch (err: any) {
    console.error("Pluggy connect-token error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
