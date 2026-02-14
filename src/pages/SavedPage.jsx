import { useState, useMemo } from 'react';
import { BookOpen, ShoppingBag, Save, Trash2, Check, X, Film, ShoppingCart } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { getCoupangSearchUrl } from '../utils/recipeGenerator';

export function SavedPage({
    recipes,
    onRecipeClick,
    shoppingList = [],
    onToggleShoppingItem,
    onRemoveShoppingItem,
    onClearCompleted,
    settings,
    creators = [],
}) {
    const [activeTab, setActiveTab] = useState('favorite_recipes');
    const [selectedCreator, setSelectedCreator] = useState(null);

    const handleBuyItem = (ingredientName) => {
        const url = getCoupangSearchUrl(ingredientName, settings?.coupangPartnersId);
        window.open(url, '_blank');
    };

    // Filter favorite recipes
    const favoriteRecipes = recipes.filter(r => r.isFavorite);

    // Filter creators to only show those present in favorite recipes
    const relevantCreators = useMemo(() => {
        const favoriteCreatorHandles = new Set(favoriteRecipes.map(r => r.creatorHandle).filter(Boolean));
        return creators.filter(c => favoriteCreatorHandles.has(c.handle));
    }, [favoriteRecipes, creators]);

    // Filter by creator if selected
    const displayedRecipes = selectedCreator
        ? favoriteRecipes.filter(r => r.creatorHandle === selectedCreator)
        : favoriteRecipes;

    // Sort recipes by savedAt date, most recent first
    const sortedRecipes = [...displayedRecipes].sort(
        (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
    );

    // Group shopping items by recipe
    const groupedByRecipe = shoppingList.reduce((acc, item) => {
        const key = item.recipeTitle || '기타';
        if (!acc[key]) {
            acc[key] = { recipeTitle: key, recipeId: item.recipeId, items: [] };
        }
        acc[key].items.push(item);
        return acc;
    }, {});

    const completedCount = shoppingList.filter((item) => item.completed).length;

    return (
        <div className="page">
            {/* Header */}
            <header className="header">
                <h1 className="header-title">즐겨찾기</h1>
            </header>

            {/* Tabs */}
            <div className="saved-tabs">
                <button
                    className={`saved-tab ${activeTab === 'favorite_recipes' ? 'saved-tab--active' : ''}`}
                    onClick={() => setActiveTab('favorite_recipes')}
                >
                    <BookOpen size={16} /> 즐겨찾기
                    <span className="saved-tab__count">{favoriteRecipes.length}</span>
                </button>
                <button
                    className={`saved-tab ${activeTab === 'shopping' ? 'saved-tab--active' : ''}`}
                    onClick={() => setActiveTab('shopping')}
                >
                    <ShoppingBag size={16} /> 장보기 리스트
                    <span className="saved-tab__count">{shoppingList.length}</span>
                </button>
            </div>

            {/* Recipes Tab */}
            {activeTab === 'favorite_recipes' && (
                <>
                    {/* Creator Filter */}
                    {favoriteRecipes.length > 0 && creators.length > 0 && (
                        <div className="filter-row">
                            <button
                                className={`chip ${!selectedCreator ? 'active' : ''}`}
                                onClick={() => setSelectedCreator(null)}
                            >
                                전체
                            </button>
                            {creators.map((creator) => (
                                <button
                                    key={creator.handle}
                                    className={`chip ${selectedCreator === creator.handle ? 'active' : ''}`}
                                    onClick={() => setSelectedCreator(creator.handle)}
                                >
                                    {creator.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {sortedRecipes.length > 0 ? (
                        <div className="recipe-grid">
                            {sortedRecipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} onClick={onRecipeClick} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state__icon"><Save size={48} color="var(--color-text-muted)" /></div>
                            <h3 className="empty-state__title">즐겨찾는 레시피가 없어요</h3>
                            <p className="empty-state__text">
                                레시피 상세 페이지에서<br />
                                별 모양을 눌러 추가해보세요!
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Shopping List Tab */}
            {activeTab === 'shopping' && (
                <div className="shopping-checklist">
                    {shoppingList.length > 0 ? (
                        <>
                            {/* Progress bar */}
                            <div className="shopping-progress">
                                <div className="shopping-progress__bar">
                                    <div
                                        className="shopping-progress__fill"
                                        style={{
                                            width: `${shoppingList.length > 0 ? (completedCount / shoppingList.length) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                                <span className="shopping-progress__text">
                                    {completedCount}/{shoppingList.length} 완료
                                </span>
                            </div>

                            {/* Grouped items */}
                            {Object.values(groupedByRecipe).map((group) => (
                                <div key={group.recipeTitle} className="shopping-group">
                                    <div className="shopping-group__header">
                                        <span className="shopping-group__recipe-icon"><Film size={16} /></span>
                                        <span className="shopping-group__recipe-title">{group.recipeTitle}</span>
                                    </div>
                                    <div className="shopping-group__items">
                                        {group.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`shopping-list-item ${item.completed ? 'shopping-list-item--completed' : ''}`}
                                            >
                                                <button
                                                    className="shopping-list-item__check"
                                                    onClick={() => onToggleShoppingItem && onToggleShoppingItem(item.id)}
                                                >
                                                    {item.completed ? <Check size={14} /> : <div style={{ width: 14, height: 14 }} />}
                                                </button>
                                                <span className="shopping-list-item__emoji">{item.emoji}</span>
                                                <div className="shopping-list-item__info">
                                                    <span className={`shopping-list-item__name ${item.completed ? 'line-through' : ''}`}>
                                                        {item.name}
                                                    </span>
                                                    <span className="shopping-list-item__amount">
                                                        {item.amount}{item.unit}
                                                    </span>
                                                </div>
                                                <button
                                                    className="shopping-list-item__delete"
                                                    onClick={() => onRemoveShoppingItem && onRemoveShoppingItem(item.id)}
                                                >
                                                    <X size={14} />
                                                </button>
                                                <button
                                                    className="shopping-list-item__buy-btn"
                                                    onClick={() => handleBuyItem(item.name)}
                                                >
                                                    <ShoppingCart size={12} /> 구매하기
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Clear completed button */}
                            {completedCount > 0 && (
                                <button
                                    className="btn btn-secondary shopping-clear-btn"
                                    onClick={onClearCompleted}
                                >
                                    <Trash2 size={16} /> 완료 항목 삭제 ({completedCount}개)
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state__icon"><ShoppingBag size={48} color="var(--color-text-muted)" /></div>
                            <h3 className="empty-state__title">장보기 목록이 비어있어요</h3>
                            <p className="empty-state__text">
                                레시피 상세 페이지에서<br />
                                재료를 선택하여 추가해보세요!
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
