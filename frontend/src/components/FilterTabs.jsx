const FilterTabs = ({ activeFilter, onFilterChange, counts = {} }) => {
  const filters = [
    { id: 'all', label: 'All', count: counts.all || 0 },
    { id: 'pending', label: 'Pending', count: counts.pending || 0 },
    { id: 'approved', label: 'Approved', count: counts.approved || 0 },
    { id: 'rejected', label: 'Rejected', count: counts.rejected || 0 }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-border">
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`
            px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300
            flex items-center gap-2 whitespace-nowrap
            ${
              activeFilter === filter.id
                ? 'bg-primary text-primary-contrast shadow-lg shadow-primary/30'
                : 'bg-surface text-content-muted hover:text-content hover:bg-surface-2'
            }
          `}
        >
          {filter.label}
          <span className={`
            text-xs font-bold px-2 py-0.5 rounded-full tabular-nums
            ${activeFilter === filter.id ? 'bg-primary-contrast/20' : 'bg-surface-2'}
          `}>
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
