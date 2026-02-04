import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TutorSearchFilters } from "@/components/features/tutor/TutorSearchFilters";
import { TutorCard } from "@/components/features/tutor/TutorCard";
import { useTutors, TutorFilters } from "@/hooks/useTutors";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Grid, List } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";

export default function SearchPage() {
  const [filters, setFilters] = useState<TutorFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"rating" | "price" | "hours">("rating");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: tutors = [], isLoading, error, refetch } = useTutors(filters);

  // Debug logging
  useEffect(() => {
    console.log("[SearchPage] Tutors data:", tutors);
    console.log("[SearchPage] Tutors count:", tutors.length);
    console.log("[SearchPage] Is loading:", isLoading);
    console.log("[SearchPage] Error:", error);
    console.log("[SearchPage] Filters:", filters);
  }, [tutors, isLoading, error, filters]);

  // Force refetch on mount to clear cache
  useEffect(() => {
    console.log("[SearchPage] Component mounted, refetching tutors...");
    refetch();
  }, []);

  // Filter and sort tutors
  const filteredTutors = tutors
    .filter((tutor) => {
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        return (
          tutor.name?.toLowerCase().includes(query) ||
          tutor.subjects?.some((s) => s && typeof s === 'string' && s.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "price":
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);
        case "hours":
          return (b.totalHours || 0) - (a.totalHours || 0);
        default:
          return 0;
      }
    });

  return (
      <div className="container mx-auto px-4 py-8 relative">
        <PageHeader
          title="Find Tutors"
          description="Browse verified HKU/UST tutors with verified reputation"
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <TutorSearchFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cast your line... search by name or subject"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 relative"
                />
                {/* Subtle wave accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>
              <div className="flex items-center space-x-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  Found {filteredTutors.length} tutor{filteredTutors.length !== 1 ? "s" : ""}
                </>
              )}
            </div>

            {/* Tutor Cards */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner variant="bubbles" size="lg" text="Reeling in tutors..." />
              </div>
            ) : filteredTutors.length === 0 ? (
              <EmptyState
                title="No tutors in these waters yet"
                description="Try adjusting your filters or search query to find the perfect tutor"
                action={{
                  label: "Clear Filters",
                  onClick: () => {
                    setFilters({});
                    setSearchQuery("");
                  },
                }}
              />
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {filteredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

