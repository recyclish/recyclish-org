import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedState: string;
  setSelectedState: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  states: string[];
  categories: string[];
  onClear: () => void;
  totalResults: number;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  selectedState,
  setSelectedState,
  selectedCategory,
  setSelectedCategory,
  states,
  categories,
  onClear,
  totalResults,
}: SearchFiltersProps) {
  const hasFilters = searchTerm || selectedState !== "all" || selectedCategory !== "all";

  const formatCategory = (cat: string) => {
    return cat
      .replace("Recycling ", "Recycling ")
      .replace("Secondary ", "Secondary ")
      .replace("Recyclers", "Recycling")
      .replace("(MRFs)", "")
      .trim();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-xl shadow-lg border border-border/50 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-semibold">Find Recycling Centers</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="text-sm font-label text-muted-foreground mb-1.5 block">
            Search by name or address
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="e.g., Green Earth Recycling or Los Angeles"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-body"
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-label text-muted-foreground mb-1.5 block">
            State
          </label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-label text-muted-foreground mb-1.5 block">
            Category
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {formatCategory(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <p className="text-sm font-body text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span> recycling facilities
        </p>
        
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground font-label"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </motion.div>
  );
}
