
-- Add Lighthouse as an available tool in the tools table.
INSERT INTO public.tools (name, category, api_endpoint, version, config_schema)
VALUES (
    'lighthouse',
    'performance',
    '/functions/v1/lighthouse-analysis',
    'latest',
    '{
        "type": "object",
        "properties": {
            "url": {
                "type": "string",
                "format": "uri",
                "description": "The URL to audit with Lighthouse."
            },
            "device": {
                "type": "string",
                "enum": ["mobile", "desktop"],
                "default": "mobile",
                "description": "The device to emulate for the audit."
            }
        },
        "required": ["url"]
    }'::jsonb
)
ON CONFLICT (name) DO NOTHING;
