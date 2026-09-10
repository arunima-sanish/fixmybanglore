import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function PlaceFilter({ places, selectedPlace, setSelectedPlace }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">Filter by place</span>

      <Select value={selectedPlace} onValueChange={setSelectedPlace}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select place" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="All">All</SelectItem>

          {places.map((place) => (
            <SelectItem key={place} value={place}>
              {place}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}