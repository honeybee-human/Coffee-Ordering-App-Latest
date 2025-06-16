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
      <select
        id="group-filter"
        value={selectedGroup}
        onChange={e => onChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="all">All Groups</option>
        {groupNames.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    </div>
  );
};