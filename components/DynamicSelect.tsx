
import React from 'react';
import { Plus } from 'lucide-react';

interface DynamicSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  listType: string;
  required?: boolean;
  onAddClick: (type: string) => void;
}

export const DynamicSelect: React.FC<DynamicSelectProps> = ({
  label,
  value,
  onChange,
  options,
  listType,
  required = false,
  onAddClick
}) => {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
        >
          <option value="">Selecione...</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onAddClick(listType)}
          className="p-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          title={`Adicionar novo(a) ${label}`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
