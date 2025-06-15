
-- Add Snyk as an available tool in the tools table.
INSERT INTO public.tools (name, category, api_endpoint, version, config_schema)
VALUES (
    'snyk',
    'security',
    '/functions/v1/snyk-analysis',
    'latest',
    '{
        "type": "object",
        "properties": {
            "organizationId": {
                "type": "string",
                "description": "Snyk Organization ID to associate scans with."
            },
            "severityThreshold": {
                "type": "string",
                "enum": ["low", "medium", "high", "critical"],
                "description": "The minimum severity level to report."
            }
        },
        "required": ["organizationId"]
    }'::jsonb
)
ON CONFLICT (name) DO NOTHING;
