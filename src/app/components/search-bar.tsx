import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CustomSearchBarProps {
    searchInput: string;
    setSearchInput: (v: string) => void;
}

export default function CustomSearchBar({ searchInput, setSearchInput }: CustomSearchBarProps) {
    return <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
            placeholder="Buscar por nombre..."
            value={searchInput}
            onChange={(e) => {
                setSearchInput(e.target.value);
            }}
            className="pl-10 pr-4 py-2 w-full md:w-[320px] rounded-md border border-gray-200 bg-white shadow-sm"
        />
    </div>;
}