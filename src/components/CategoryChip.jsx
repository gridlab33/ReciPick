export function CategoryChip({ label, active = false, onClick, icon }) {
    return (
        <button
            className={`chip ${active ? 'active' : ''}`}
            onClick={onClick}
        >
            {icon && <span>{icon}</span>}
            <span>{label}</span>
        </button>
    );
}
