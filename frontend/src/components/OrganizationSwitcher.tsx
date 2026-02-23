import { Building2 } from 'lucide-react';
import { Organization } from '../types';

interface Props {
  organizations: Organization[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function OrganizationSwitcher({ organizations, selectedId, onSelect }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Building2 size={16} className="text-slate-400" />
      <select
        value={selectedId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <option value="" disabled>
          Select organization…
        </option>
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
}
