import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Accessibility, Code } from 'lucide-react';

interface IssueFiltersProps {
  selectedFilters: string[];
  onFiltersChange: (filters: string[]) => void;
}

export const IssueFilters = ({ selectedFilters, onFiltersChange }: IssueFiltersProps) => {
  const filterOptions = [
    { id: 'security', label: 'Security', icon: Shield, color: 'destructive' },
    { id: 'performance', label: 'Performance', icon: Zap, color: 'secondary' },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility, color: 'outline' },
    { id: 'code_quality', label: 'Code Quality', icon: Code, color: 'outline' },
  ];

  const toggleFilter = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(f => f !== filterId)
      : [...selectedFilters, filterId];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Filter by Issue Type</h3>
          {selectedFilters.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const isSelected = selectedFilters.includes(option.id);
            const Icon = option.icon;
            
            return (
              <Button
                key={option.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleFilter(option.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {option.label}
                {isSelected && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    ✓
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
        
        {selectedFilters.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Active filters: {selectedFilters.map(f => 
                filterOptions.find(opt => opt.id === f)?.label
              ).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
