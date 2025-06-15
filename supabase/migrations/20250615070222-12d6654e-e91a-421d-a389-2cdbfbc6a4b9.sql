
-- Add ESLint as an available tool in the tools table.
INSERT INTO public.tools (name, category, api_endpoint, version, config_schema)
VALUES (
    'eslint',
    'linter',
    '/functions/v1/eslint-analysis',
    '9.x',
    '{
        "type": "object",
        "properties": {
            "rules": {
                "type": "object",
                "description": "ESLint rules configuration."
            },
            "parserOptions": {
                "type": "object",
                "description": "ESLint parser options."
            },
            "env": {
                "type": "object",
                "description": "ESLint environment configuration."
            }
        }
    }'::jsonb
)
ON CONFLICT (name) DO NOTHING;
