import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Utensils, User, ChevronDown, ChevronUp, ChefHat, ShoppingBasket, MousePointerClick, Check, Edit2, Share2, Trash2, ShoppingCart, Star } from 'lucide-react';
import { getSourceInfo, extractInstagramId, extractTikTokVideoId } from '../utils/urlParser';
import { SourceIcon } from '../components/SourceIcon';
import { TikTokEmbed } from '../components/TikTokEmbed';
import { generateRecipeData, getCoupangSearchUrl } from '../utils/recipeGenerator';

export function RecipeDetailPage({ recipe, onBack, onUpdate, onDelete, onAddToShoppingList, onToggleFavorite }) {
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState(recipe?.notes || '');
    const [showRecipe, setShowRecipe] = useState(true);
    const [checkedIngredients, setCheckedIngredients] = useState(new Set());
    const sourceInfo = getSourceInfo(recipe?.source);

    // Extract Instagram ID if applicable
    const instagramId = recipe?.source === 'instagram' ? extractInstagramId(recipe.url) : null;

    // Generate recipe data based on recipe info
    const recipeData = useMemo(() => generateRecipeData(recipe), [recipe]);

    if (!recipe) return null;

    const handleSaveNotes = () => {
        onUpdate(recipe.id, { notes });
        setIsEditing(false);
    };

    const handleOpenOriginal = () => {
        window.open(recipe.url, '_blank');
    };

    const handleDelete = () => {
        if (window.confirm('이 레시피를 삭제하시겠습니까?')) {
            onDelete(recipe.id);
            onBack();
        }
    };

    const toggleIngredientCheck = (ingredientName) => {
        setCheckedIngredients((prev) => {
            const next = new Set(prev);
            if (next.has(ingredientName)) {
                next.delete(ingredientName);
            } else {
                next.add(ingredientName);
            }
            return next;
        });
    };

    const handleAddToShoppingList = () => {
        const selectedIngredients = recipeData.ingredients
            .filter((ing) => checkedIngredients.has(ing.name))
            .map((ing) => ({
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
                emoji: ing.emoji,
                recipeId: recipe.id,
                recipeTitle: recipe.title || '제목 없음',
            }));

        if (selectedIngredients.length > 0 && onAddToShoppingList) {
            onAddToShoppingList(selectedIngredients);
            setCheckedIngredients(new Set());
            // Show brief confirmation
            alert(`${selectedIngredients.length}개의 재료가 장보기 체크리스트에 추가되었습니다!`);
        }
    };

    const handleOpenCoupang = (ingredientName, e) => {
        e.stopPropagation();
        window.open(getCoupangSearchUrl(ingredientName), '_blank');
    };

    // Load TikTok script if needed -> Moved to TikTokEmbed component

    return (
        <div className="page" style={{ paddingBottom: checkedIngredients.size > 0 ? '160px' : '100px' }}>
            {/* Header Image or Video */}
            <div className="detail-header">
                {instagramId ? (
                    <div className="detail-video-container" style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden', paddingBottom: '0', borderRadius: 'var(--radius-md)', background: '#000' }}>
                        <iframe
                            src={`https://www.instagram.com/p/${instagramId}/embed/captioned/`}
                            style={{ width: '100%', height: '100%', border: 'none', objectFit: 'cover' }}
                            frameBorder="0"
                            scrolling="no"
                            allowTransparency="true"
                            allow="encrypted-media"
                        />
                    </div>
                ) : recipe.source === 'tiktok' ? (
                    <div className="detail-video-container" style={{
                        width: '100vw',
                        marginLeft: 'calc(50% - 50vw)',
                        marginRight: 'calc(50% - 50vw)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <TikTokEmbed key={recipe.videoId || recipe.url} url={recipe.url} videoId={recipe.videoId || extractTikTokVideoId(recipe.url)} />
                    </div>
                ) : recipe.thumbnail ? (
                    <img src={recipe.thumbnail} alt={recipe.title} className="detail-image" />
                ) : (
                    <div
                        className="detail-image"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '4rem',
                        }}
                    >
                        <Utensils size={64} color="#ffffff" />
                    </div>
                )}
                <button className="detail-back" onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
            </div>

            <div className="detail-content">
                {/* Source Badge */}
                {sourceInfo && (
                    <div className="detail-source">
                        <span className={`source-badge ${recipe.source}`}><SourceIcon source={recipe.source} size={14} /></span>
                        <span style={{ fontWeight: 500 }}>{sourceInfo.label}</span>
                        {recipe.creatorHandle && (
                            <span style={{ color: 'var(--color-text-light)' }}>{recipe.creatorHandle}</span>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(recipe.id);
                            }}
                            style={{
                                marginLeft: 'auto',
                                background: 'none',
                                border: 'none',
                                padding: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: recipe.isFavorite ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            }}
                        >
                            <Star size={24} fill={recipe.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                )}

                {/* Title */}
                <h1 className="detail-title">{recipe.title || '제목 없음'}</h1>

                {/* Creator Card */}
                {recipe.creatorName && (
                    <div className="detail-creator">
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--color-primary-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                            }}
                        >
                            <User size={24} color="var(--color-primary-dark)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600 }}>{recipe.creatorName}</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-dark)' }}>
                                이 크리에이터의 다른 레시피 보기 →
                            </div>
                        </div>
                    </div>
                )}

                {/* Categories */}
                {recipe.categories?.length > 0 && (
                    <div className="detail-tags">
                        {recipe.categories.map((cat) => (
                            <span key={cat} className="detail-tag">
                                {cat}
                            </span>
                        ))}
                    </div>
                )}

                {/* Open Original Button */}
                <button
                    className="btn btn-primary"
                    onClick={handleOpenOriginal}
                    style={{ width: '100%', marginBottom: 'var(--spacing-lg)' }}
                >
                    원본 영상 보기 ↗
                </button>

                {/* ===== VIDEO DESCRIPTION SECTION ===== */}
                {recipe.description && (
                    <div className="recipe-section">
                        <div
                            className="recipe-section__header"
                            onClick={() => setShowRecipe(!showRecipe)}
                        >
                            <h3 className="recipe-section__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ChefHat size={20} /> 영상설명</h3>
                            <span className={`recipe-section__toggle ${showRecipe ? 'open' : ''}`}>
                                {showRecipe ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </span>
                        </div>

                        {showRecipe && (
                            <div className="recipe-section__body">
                                <div className="recipe-description" style={{
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.6',
                                    color: 'var(--color-text)',
                                    padding: 'var(--spacing-md)'
                                }}>
                                    {recipe.description}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== SHOPPING SECTION ===== */}
                <div className="shopping-section">
                    <h3 className="shopping-section__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShoppingBasket size={20} /> 재료 & 장보기</h3>

                    {/* Visual hint banner */}
                    <div className="shopping-hint">
                        <span className="shopping-hint__icon"><MousePointerClick size={16} /></span>
                        <span className="shopping-hint__text">
                            재료를 터치하여 <strong>장보기 리스트</strong>에 담아보세요
                        </span>
                        <span className="shopping-hint__pulse" />
                    </div>

                    <div className="shopping-slider">
                        {recipeData.ingredients.map((ing, idx) => {
                            const isChecked = checkedIngredients.has(ing.name);
                            return (
                                <div
                                    key={idx}
                                    className={`shopping-card ${isChecked ? 'shopping-card--checked' : ''}`}
                                    onClick={() => toggleIngredientCheck(ing.name)}
                                >
                                    <div className="shopping-card__thumb">
                                        <span className="shopping-card__emoji">{ing.emoji}</span>
                                        {/* Always-visible checkbox indicator */}
                                        <div className={`shopping-card__checkbox ${isChecked ? 'shopping-card__checkbox--checked' : ''}`}>
                                            {isChecked ? <Check size={12} color="white" /> : ''}
                                        </div>
                                        {isChecked && (
                                            <div className="shopping-card__check-overlay">
                                                <span className="shopping-card__checkmark"><Check size={24} color="white" /></span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="shopping-card__info">
                                        <div className="shopping-card__name">{ing.name}</div>
                                        <div className="shopping-card__amount">{ing.amount}{ing.unit}</div>
                                    </div>
                                    <button
                                        className="shopping-card__coupang-btn"
                                        onClick={(e) => handleOpenCoupang(ing.name, e)}
                                    >
                                        <ShoppingCart size={12} /> 최저가 쇼핑하기
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Notes */}
                <div className="detail-notes">
                    <div className="detail-notes__label">나의 메모</div>
                    {isEditing ? (
                        <div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="나만의 요리 팁을 적어보세요..."
                            />
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                                <button className="btn btn-primary" onClick={handleSaveNotes}>
                                    저장
                                </button>
                                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                    취소
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--color-white)',
                                borderRadius: 'var(--radius-md)',
                                minHeight: 80,
                                cursor: 'pointer',
                            }}
                        >
                            {recipe.notes || (
                                <span style={{ color: 'var(--color-text-muted)' }}>
                                    탭하여 메모 추가...
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="detail-actions">
                    <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Edit2 size={16} /> 수정
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Share2 size={16} /> 공유
                    </button>
                    <button className="btn btn-secondary" onClick={handleDelete} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Trash2 size={16} /> 삭제
                    </button>
                </div>

                {/* Saved Date */}
                <div
                    style={{
                        marginTop: 'var(--spacing-xl)',
                        textAlign: 'center',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    {recipe.savedAt && `저장일: ${new Date(recipe.savedAt).toLocaleDateString('ko-KR')}`}
                </div>
            </div>

            {/* Floating Add to Shopping List Button */}
            {checkedIngredients.size > 0 && (
                <div className="shopping-floating-bar">
                    <button className="shopping-floating-btn" onClick={handleAddToShoppingList} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <ShoppingCart size={20} /> 장보기 체크리스트에 추가 ({checkedIngredients.size}개)
                    </button>
                </div>
            )}
        </div>
    );
}
