import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Building2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Facility {
  Name: string;
  Address: string;
  Category: string;
  State: string;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  facilities: Facility[];
  placeholder?: string;
  className?: string;
}

interface Suggestion {
  type: "name" | "address" | "city";
  text: string;
  facility: Facility;
  matchStart: number;
  matchEnd: number;
}

export function SearchAutocomplete({
  value,
  onChange,
  facilities,
  placeholder = "Search by name, address, or city...",
  className = "",
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build search index for faster lookups
  const searchIndex = useMemo(() => {
    const index: Map<string, Set<number>> = new Map();
    
    facilities.forEach((facility, idx) => {
      // Index name words
      const nameWords = facility.Name.toLowerCase().split(/\s+/);
      nameWords.forEach(word => {
        if (word.length >= 2) {
          const key = word.substring(0, 3);
          if (!index.has(key)) index.set(key, new Set());
          index.get(key)!.add(idx);
        }
      });
      
      // Index address words
      const addressWords = facility.Address.toLowerCase().split(/[\s,]+/);
      addressWords.forEach(word => {
        if (word.length >= 2) {
          const key = word.substring(0, 3);
          if (!index.has(key)) index.set(key, new Set());
          index.get(key)!.add(idx);
        }
      });
    });
    
    return index;
  }, [facilities]);

  // Debounced search function
  const searchFacilities = useCallback((query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length >= 2);
    
    if (queryWords.length === 0) {
      setSuggestions([]);
      return;
    }

    // Get candidate facilities from index
    const candidateIndices = new Set<number>();
    queryWords.forEach(word => {
      const key = word.substring(0, 3);
      const indices = searchIndex.get(key);
      if (indices) {
        indices.forEach(idx => candidateIndices.add(idx));
      }
    });

    // Score and filter candidates
    const results: Suggestion[] = [];
    const seenNames = new Set<string>();
    const seenAddresses = new Set<string>();

    candidateIndices.forEach(idx => {
      const facility = facilities[idx];
      const lowerName = facility.Name.toLowerCase();
      const lowerAddress = facility.Address.toLowerCase();

      // Check name match
      const nameMatchIndex = lowerName.indexOf(lowerQuery);
      if (nameMatchIndex !== -1 && !seenNames.has(lowerName)) {
        seenNames.add(lowerName);
        results.push({
          type: "name",
          text: facility.Name,
          facility,
          matchStart: nameMatchIndex,
          matchEnd: nameMatchIndex + query.length,
        });
      }

      // Check address match
      const addressMatchIndex = lowerAddress.indexOf(lowerQuery);
      if (addressMatchIndex !== -1 && !seenAddresses.has(lowerAddress)) {
        seenAddresses.add(lowerAddress);
        results.push({
          type: "address",
          text: facility.Address,
          facility,
          matchStart: addressMatchIndex,
          matchEnd: addressMatchIndex + query.length,
        });
      }

      // Check city match (extract city from address)
      const addressParts = facility.Address.split(",");
      if (addressParts.length >= 2) {
        const city = addressParts[1]?.trim() || "";
        const lowerCity = city.toLowerCase();
        const cityKey = `${lowerCity}-${facility.State}`;
        if (lowerCity.includes(lowerQuery) && !seenAddresses.has(cityKey)) {
          seenAddresses.add(cityKey);
          const cityMatchIndex = lowerCity.indexOf(lowerQuery);
          results.push({
            type: "city",
            text: `${city}, ${facility.State}`,
            facility,
            matchStart: cityMatchIndex,
            matchEnd: cityMatchIndex + query.length,
          });
        }
      }
    });

    // Sort by relevance (exact matches first, then by match position)
    results.sort((a, b) => {
      // Prioritize name matches
      if (a.type === "name" && b.type !== "name") return -1;
      if (b.type === "name" && a.type !== "name") return 1;
      
      // Then by match position (earlier is better)
      if (a.matchStart !== b.matchStart) return a.matchStart - b.matchStart;
      
      // Then alphabetically
      return a.text.localeCompare(b.text);
    });

    // Limit to 8 suggestions
    setSuggestions(results.slice(0, 8));
  }, [facilities, searchIndex]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchFacilities(value);
    }, 150);

    return () => clearTimeout(timer);
  }, [value, searchFacilities]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selected = suggestions[selectedIndex];
          onChange(selected.type === "name" ? selected.text : selected.facility.Name);
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.type === "name" ? suggestion.text : suggestion.facility.Name);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightMatch = (text: string, start: number, end: number) => {
    if (start < 0 || end > text.length) return text;
    
    return (
      <>
        {text.substring(0, start)}
        <span className="bg-primary/20 text-primary font-medium">
          {text.substring(start, end)}
        </span>
        {text.substring(end)}
      </>
    );
  };

  // Get icon for suggestion type
  const getIcon = (type: Suggestion["type"]) => {
    switch (type) {
      case "name":
        return <Building2 className="h-4 w-4 text-primary" />;
      case "address":
      case "city":
        return <MapPin className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 font-body"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            <ul className="py-1 max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.type}-${suggestion.text}-${index}`}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-2.5 flex items-start gap-3 text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <span className="mt-0.5 flex-shrink-0">
                      {getIcon(suggestion.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {highlightMatch(suggestion.text, suggestion.matchStart, suggestion.matchEnd)}
                      </p>
                      {suggestion.type !== "name" && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {suggestion.facility.Name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {suggestion.facility.Category}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="px-4 py-2 bg-muted/50 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px] ml-1">↓</kbd>
                <span className="ml-2">to navigate</span>
                <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px] ml-3">Enter</kbd>
                <span className="ml-2">to select</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
