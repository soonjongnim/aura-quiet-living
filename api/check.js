export default function handler(req, res) {
    const envKeys = Object.keys(process.env).filter(k => k.includes('NOTION'));
    res.status(200).json({
        message: "Env debug",
        found_notion_keys: envKeys,
        has_api_key: !!process.env.NOTION_API_KEY,
        has_token: !!process.env.NOTION_TOKEN,
        node_env: process.env.NODE_ENV,
        vercel: process.env.VERCEL
    });
}
