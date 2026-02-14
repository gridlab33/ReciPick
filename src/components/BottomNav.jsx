import { Home, FolderOpen, Plus, Star, Settings } from 'lucide-react';

export function BottomNav({ currentPage, onNavigate, onAddClick }) {
    const navItems = [
        { id: 'home', label: '홈', icon: <Home /> },
        { id: 'categories', label: '카테고리', icon: <FolderOpen /> },
        { id: 'add', label: '추가', icon: <Plus />, isAdd: true },
        { id: 'favorites', label: '즐겨찾기', icon: <Star /> },
        { id: 'settings', label: '설정', icon: <Settings /> },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) =>
                item.isAdd ? (
                    <button
                        key={item.id}
                        className="nav-add-btn"
                        onClick={onAddClick}
                        aria-label="레시피 추가"
                    >
                        {item.icon}
                    </button>
                ) : (
                    <button
                        key={item.id}
                        className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                        aria-label={item.label}
                    >
                        <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                )
            )}
        </nav>
    );
}
