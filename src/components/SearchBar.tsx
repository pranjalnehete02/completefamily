import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  resultsCount: number;
}

export const SearchBar = ({ value, onChange, onClear, resultsCount }: SearchBarProps) => {
  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search family members..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10 h-12 bg-card border-2 focus-visible:ring-primary"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {value && (
        <p className="text-sm text-muted-foreground mt-2">
          {resultsCount > 0 ? (
            <>
              Found <span className="font-semibold text-primary">{resultsCount}</span>{" "}
              {resultsCount === 1 ? "match" : "matches"}
            </>
          ) : (
            "No matches found"
          )}
        </p>
      )}
    </div>
  );
};
