
export function generateFixSuggestionForRule(issue: any) {
  const ruleId = issue.ruleId;
  const suggestions: Record<string, any> = {
    'no-unused-vars': {
      fix_description: 'Remove the unused variable or prefix it with underscore if intentionally unused',
      code_example: 'const unusedVar = "value";',
      fixed_code_example: '// Remove: const unusedVar = "value";\n// Or: const _unusedVar = "value";',
      difficulty_level: 'easy',
      estimated_time_minutes: 2,
      category: 'code_quality',
      priority: 3,
    },
    'no-console': {
      fix_description: 'Remove console statements or use a proper logging library',
      code_example: 'console.log("debug message");',
      fixed_code_example: '// Remove or replace with proper logging\n// logger.debug("debug message");',
      difficulty_level: 'easy',
      estimated_time_minutes: 1,
      category: 'code_quality',
      priority: 2,
    },
    'semi': {
      fix_description: 'Add missing semicolon at the end of the statement',
      code_example: 'const x = 5',
      fixed_code_example: 'const x = 5;',
      difficulty_level: 'easy',
      estimated_time_minutes: 1,
      category: 'style_violations',
      priority: 1,
    },
  };

  return suggestions[ruleId] || null;
}

export async function generateFixSuggestions(supabase: any, resultId: string, issues: any[]) {
  const suggestions = [];

  for (const issue of issues) {
    const suggestion = generateFixSuggestionForRule(issue);
    if (suggestion) {
      suggestions.push({
        result_id: resultId,
        rule_id: issue.ruleId,
        issue_description: issue.message,
        ...suggestion,
      });
    }
  }

  if (suggestions.length > 0) {
    await supabase.from('eslint_fix_suggestions').insert(suggestions);
  }
}
