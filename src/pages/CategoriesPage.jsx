import { useState } from 'react';
import { MapPin, Utensils, Users, Tag, Plus, Check, X, Trash2 } from 'lucide-react';
import { getSupportedSources } from '../utils/urlParser';
import { SourceIcon } from '../components/SourceIcon';

export function CategoriesPage({
    recipes,
    customCategories,
    creators,
    onAddCategory,
    onDeleteCategory,
    onSourceClick,
    onCategoryClick,
    onCreatorClick
}) {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategory, setShowNewCategory] = useState(false);

    const supportedSources = getSupportedSources();

    // Count recipes by source
    const sourceCounts = supportedSources.map((source) => ({
        ...source,
        count: (recipes || []).filter((r) => r.source === source.name).length,
    }));

    // Count recipes by category
    const categoryCounts = (customCategories || []).map((cat) => ({
        name: cat,
        count: (recipes || []).filter((r) => r.categories?.includes(cat)).length,
    }));

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            onAddCategory(newCategoryName.trim());
            setNewCategoryName('');
            setShowNewCategory(false);
        }
    };

    return (
        <div className="page">
            {/* Header */}
            <header className="header">
                <h1 className="header-title">카테고리</h1>
            </header>

            <div style={{ padding: 'var(--spacing-md)' }}>
                {/* Section: By Source */}
                <section className="category-section">
                    <h2 className="category-section__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={20} /> 출처별</h2>
                    <div className="category-list">
                        {sourceCounts.map((source) => (
                            <div
                                key={source.name}
                                className="category-item"
                                onClick={() => onSourceClick(source.name)}
                            >
                                <div className="category-item__info">
                                    <span className={`source-badge ${source.name}`}><SourceIcon source={source.name} size={14} /></span>
                                    <span style={{ fontWeight: 500 }}>{source.label}</span>
                                </div>
                                <span className="category-item__count">{source.count}개</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: By Cuisine Type */}
                <section className="category-section">
                    <h2 className="category-section__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Utensils size={20} /> 요리 종류</h2>
                    <div className="category-list">
                        {categoryCounts.map((cat) => (
                            <div
                                key={cat.name}
                                className="category-item"
                                onClick={() => onCategoryClick(cat.name)}
                            >
                                <div className="category-item__info">
                                    <span
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 'var(--radius-sm)',
                                            background: 'var(--color-primary-light)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ffffff'
                                        }}
                                    >
                                        <Tag size={12} />
                                    </span>
                                    <span style={{ fontWeight: 500 }}>{cat.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <span className="category-item__count">{cat.count}개</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까?\n해당 카테고리의 레시피들은 삭제되지 않습니다.`)) {
                                                onDeleteCategory(cat.name);
                                            }
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 4,
                                            cursor: 'pointer',
                                            color: 'var(--color-text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add new category */}
                        {showNewCategory ? (
                            <div className="category-item" style={{ background: 'var(--color-background-secondary)' }}>
                                <input
                                    type="text"
                                    placeholder="새 카테고리 이름"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: 'var(--font-size-base)',
                                    }}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                    <button className="chip active" onClick={handleAddCategory}>
                                        <Check size={14} />
                                    </button>
                                    <button className="chip" onClick={() => setShowNewCategory(false)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowNewCategory(true)}
                                style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
                            >
                                + 새 카테고리 추가
                            </button>
                        )}
                    </div>
                </section>

                {/* Section: By Creator */}
                <section className="category-section">
                    <h2 className="category-section__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={20} /> 크리에이터별</h2>
                    {creators && creators.length > 0 ? (
                        <div className="creator-row">
                            {creators.map((creator) => (
                                <div
                                    key={creator.handle}
                                    className="creator-avatar"
                                    onClick={() => onCreatorClick(creator.handle)}
                                >
                                    <div className="creator-avatar__image">
                                        {creator.handle.charAt(1).toUpperCase()}
                                    </div>
                                    <span className="creator-avatar__name">{creator.handle}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                            저장된 레시피가 없습니다
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
}
