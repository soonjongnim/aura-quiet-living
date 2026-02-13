export default function handler(req, res) {
    const allKeys = Object.keys(process.env);
    const notionKeys = allKeys.filter(k => k.toUpperCase().includes('NOTION'));

    res.status(200).json({
        status: "Service is online",
        notion_keys_found: notionKeys,
        has_api_key: !!process.env.NOTION_API_KEY,
        has_token: !!process.env.NOTION_TOKEN,
        node_env: process.env.NODE_ENV,
        vercel_env: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
    });
}
