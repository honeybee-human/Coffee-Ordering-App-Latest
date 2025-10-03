import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui/select";
import React from "react";

interface GroupFilterProps {
  groupNames: string[];
  selectedGroup: string;
  onChange: (group: string) => void;
  label?: string;
}

export const GroupFilter: React.FC<GroupFilterProps> = ({
  groupNames,
  selectedGroup,
  onChange,
  label = "Filter by group:"
}) => {
  if (!groupNames || groupNames.length === 0) return null;
  return (
    <div className="mt-2">
      <label htmlFor="group-filter" className="mr-2 text-sm">{label}</label>
      <Select value={selectedGroup} onValueChange={onChange}>
        <SelectTrigger id="group-filter" className="bg-white h-10 border border-b-2 border-r-2 hover:shadow-[2px_2px_0_0_#964B00]">
          <SelectValue placeholder="Select group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Groups</SelectItem>
          {groupNames.map((name) => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};