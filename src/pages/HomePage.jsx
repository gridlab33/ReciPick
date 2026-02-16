import { useState } from 'react';
import { Search, BookOpen, Utensils, X } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { CategoryChip } from '../components/CategoryChip';
import { getSupportedSources } from '../utils/urlParser';
import { SourceIcon } from '../components/SourceIcon';
import { ReciPickLogo } from '../components/ReciPickLogo';

export function HomePage({ recipes, stats, onRecipeClick }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const supportedSources = getSupportedSources();

    const filters = [
        { id: 'all', label: '전체', icon: null },
        ...supportedSources.map((s) => ({ id: s.name, label: s.label, icon: <SourceIcon source={s.name} size={14} /> })),
    ];

    const filteredRecipes = recipes.filter((r) => {
        // 1. Filter by category/source
        if (activeFilter !== 'all' && r.source !== activeFilter) return false;

        // 2. Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const titleMatch = r.title?.toLowerCase().includes(query);
            const notesMatch = r.notes?.toLowerCase().includes(query);
            const descMatch = r.description?.toLowerCase().includes(query);
            return titleMatch || notesMatch || descMatch;
        }

        return true;
    });

    return (
        <div className="page">
            {/* Header with Expandable Search */}
            <header className="header">
                <div className={`header-content ${isSearchOpen ? 'hidden' : ''}`}>
                    <h1 className="header-title" style={{ display: 'flex', alignItems: 'center' }}>
                        <ReciPickLogo height={32} width={106} />
                    </h1>
                    <p className="header-subtitle" style={{ color: '#94A3B8' }}>나만의 레시피 스크랩북</p>
                </div>

                <div className={`search-container ${isSearchOpen ? 'expanded' : ''}`}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="레시피 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus={isSearchOpen}
                    />
                    <button
                        className="search-btn"
                        onClick={() => {
                            if (isSearchOpen) {
                                // If open, closing it checks if query is empty
                                if (!searchQuery) {
                                    setIsSearchOpen(false);
                                } else {
                                    // If text exists, maybe just clear text or keep open?
                                    // Let's toggle close for now
                                    setIsSearchOpen(false);
                                    setSearchQuery('');
                                }
                            } else {
                                setIsSearchOpen(true);
                            }
                        }}
                        aria-label={isSearchOpen ? "검색 닫기" : "검색"}
                    >
                        {isSearchOpen ? <X size={24} /> : <Search size={24} />}
                    </button>
                </div>
            </header>

            {/* Stats Card */}
            <div className="stats-card">
                <div>
                    <div className="stats-number">{stats.total}</div>
                    <div className="stats-label">저장된 레시피</div>
                </div>
                <div style={{ marginLeft: 'auto', opacity: 0.8 }}>
                    <BookOpen size={24} color="var(--color-primary-dark)" />
                </div>
            </div>

            {/* Filter Chips */}
            <div className="filter-row">
                {filters.map((filter) => (
                    <CategoryChip
                        key={filter.id}
                        label={filter.label}
                        icon={filter.icon}
                        active={activeFilter === filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                    />
                ))}
            </div>

            {/* Recipe Grid */}
            {filteredRecipes.length > 0 ? (
                <div className="recipe-grid">
                    {filteredRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} onClick={onRecipeClick} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state__icon"><Utensils size={48} color="var(--color-text-muted)" /></div>
                    <h3 className="empty-state__title">아직 저장된 레시피가 없어요</h3>
                    <p className="empty-state__text">
                        인스타그램, 유튜브, 틱톡에서<br />
                        맛있는 레시피를 발견하면 저장해보세요!
                    </p>
                </div>
            )}
        </div>
    );
}
