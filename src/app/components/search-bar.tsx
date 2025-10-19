import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CustomSearchBarProps {
    searchInput: string;
    setSearchInput: (v: string) => void;
}

export default function CustomSearchBar({ searchInput, setSearchInput }: CustomSearchBarProps) {
return( 
    <div className="w-[320px] h-[40px] gap-2 p-0 opacity-100 rotate-0">
        <div className="w-[320px] h-[40px] pt-2 pr-3 pb-2 pl-3 gap-4 rotate-0 opacity-100 rounded-md border border-gray-300 flex items-center justify-between">
            <Input
                placeholder="Buscar"
                value={searchInput}
                className="!border-none !ring-0 !shadow-none focus:!border-none focus:!ring-0 focus:!shadow-none"
                onChange={(e) => {
                    setSearchInput(e.target.value);
                }}
            />
            <Search/>
        </div>
    </div>
)}