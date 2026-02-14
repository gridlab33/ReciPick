import { getSourceInfo } from '../utils/urlParser';
import { SourceIcon } from './SourceIcon';
import { Utensils, Star } from 'lucide-react';
import { useState } from 'react';

export function RecipeCard({ recipe, onClick }) {
    const sourceInfo = getSourceInfo(recipe.source);
    const [imageError, setImageError] = useState(false);

    return (
        <div className="recipe-card" onClick={() => onClick(recipe)}>
            <div className="recipe-card__image">
                {recipe.thumbnail && !imageError ? (
                    <img
                        src={`https://images.weserv.nl/?url=${encodeURIComponent(recipe.thumbnail)}`}
                        alt={recipe.title}
                        onError={() => setImageError(true)}
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                        }}
                    >
                        <Utensils size={48} color="#ffffff" />
                    </div>
                )}
                {sourceInfo && (
                    <span className={`source-badge ${recipe.source} recipe-card__badge`}>
                        <SourceIcon source={recipe.source} size={14} />
                    </span>
                )}

                {recipe.isFavorite && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '50%',
                            padding: 4,
                            display: 'flex',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                    >
                        <Star size={12} fill="var(--color-primary)" color="var(--color-primary)" />
                    </div>
                )}
            </div>
            <div className="recipe-card__content">
                <p className="recipe-card__creator">{recipe.creatorHandle || recipe.creatorName || '알 수 없음'}</p>
                <h3 className="recipe-card__title">{recipe.title || '제목 없음'}</h3>
            </div>
        </div>
    );
}
