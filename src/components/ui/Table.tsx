import React from 'react';

export interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs ${className}`}>
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-[#13294B] text-white uppercase text-xs tracking-wider">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#0E1A2B]/40">
          {children}
        </tbody>
      </table>
    </div>
  );
};
