import { useState, useEffect } from 'react';
import { parseUrl, getSupportedSources, fetchYouTubeMetadata, fetchInstagramMetadata, fetchTikTokMetadata } from '../utils/urlParser';
import { Check, Loader2, Sparkles, FileText, X } from 'lucide-react';
import { SourceIcon } from './SourceIcon';

export function AddRecipeModal({ isOpen, onClose, onSave, categories, settings }) {
    const [url, setUrl] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [title, setTitle] = useState('');
    const [creatorName, setCreatorName] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [notes, setNotes] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [isTempTitle, setIsTempTitle] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState('');

    const supportedSources = getSupportedSources();

    const [thumbnail, setThumbnail] = useState(null); // Add thumbnail state

    useEffect(() => {
        if (url) {
            const parsed = parseUrl(url);
            setParsedData(parsed);

            if (parsed) {
                // Auto-fill creator name from URL (user can still edit)
                if (parsed.creatorHandle) {
                    setCreatorName(parsed.creatorHandle);
                }

                // For YouTube: Fetch real title and channel name
                if (parsed.source === 'youtube' && parsed.videoId) {
                    setIsLoading(true);
                    setIsTempTitle(false);

                    // Debug Log
                    console.log('[Debug] AddRecipeModal settings:', settings);
                    fetchYouTubeMetadata(parsed.videoId, settings?.youtubeApiKey, settings?.apifyApiToken).then((metadata) => {
                        setIsLoading(false);
                        if (metadata) {
                            if (metadata.title) {
                                setTitle(metadata.title);
                            }
                            if (metadata.authorName) {
                                setCreatorName(metadata.authorName);
                            }
                            if (metadata.description) {
                                setDescription(metadata.description);
                            }
                            if (metadata.thumbnail) {
                                setThumbnail(metadata.thumbnail);
                            }
                        } else {
                            // Fallback to suggested title if API fails
                            setTitle(parsed.suggestedTitle);
                            setIsTempTitle(true);
                        }
                    });
                } else if (parsed.source === 'instagram' && parsed.videoId) {
                    // For Instagram: Try to fetch metadata using Apify
                    setIsLoading(true);
                    // Use a slightly different approach for Instagram title - maybe keep it generic until fetched

                    fetchInstagramMetadata(parsed.videoId, settings?.apifyApiToken).then((metadata) => {
                        setIsLoading(false);
                        if (metadata) {
                            if (metadata.title && !metadata.title.startsWith('Instagram Post')) {
                                setTitle(metadata.title);
                                setIsTempTitle(false);
                            } else {
                                setTitle(parsed.suggestedTitle);
                                setIsTempTitle(true);
                            }

                            if (metadata.authorName) {
                                setCreatorName(metadata.authorName);
                            }

                            if (metadata.description) {
                                setDescription(metadata.description);
                            }

                            if (metadata.thumbnail) {
                                setThumbnail(metadata.thumbnail);
                            }
                        }
                    });
                } else if (parsed.source === 'tiktok') {
                    // For TikTok: Try to fetch metadata using Apify
                    setIsLoading(true);

                    fetchTikTokMetadata(parsed.url, settings?.apifyApiToken).then((metadata) => {
                        setIsLoading(false);
                        if (metadata) {
                            // If we got a canonical video ID (numeric) from Apify, update the parsed data
                            // This ensures the embed works even for short URLs (vt.tiktok.com)
                            if (metadata.videoId) {
                                setParsedData(prev => ({ ...prev, videoId: metadata.videoId }));
                            }

                            // If we got a canonical URL (webVideoUrl), use that instead of the short URL
                            if (metadata.canonicalUrl) {
                                setParsedData(prev => ({ ...prev, url: metadata.canonicalUrl }));
                                // Also update the input field if you want, but maybe better to keep user input visible? 
                                // Actually, for the recipe object, we need the canonical URL.
                                // The recipe is saved using `url` state if not overridden, 
                                // but `handleSave` uses `url` state. Let's update `url` state?
                                // Better: Update `url` state to canonical so it saves correctly.
                                setUrl(metadata.canonicalUrl);
                            }

                            if (metadata.title && metadata.title !== 'TikTok Video') {
                                setTitle(metadata.title);
                                setIsTempTitle(false);
                            } else {
                                setTitle(parsed.suggestedTitle);
                                setIsTempTitle(true);
                            }

                            if (metadata.authorName) {
                                setCreatorName(metadata.authorName);
                            }

                            if (metadata.description) {
                                setDescription(metadata.description);
                            }

                            if (metadata.thumbnail) {
                                setThumbnail(metadata.thumbnail);
                            }
                        }
                    });
                } else {
                    // For others: Use suggested default
                    setTitle(parsed.suggestedTitle);
                    setIsTempTitle(true);
                    if (parsed.creatorHandle) {
                        setCreatorName(parsed.creatorHandle);
                    }
                    if (parsed.thumbnail) {
                        setThumbnail(parsed.thumbnail);
                    }
                }
            }
        } else {
            setParsedData(null);
            setIsTempTitle(false);
            setThumbnail(null); // Reset thumbnail
        }
    }, [url, settings]);

    // Clear temporary title when user focuses on input
    const handleTitleFocus = () => {
        if (isTempTitle && title) {
            setTitle('');
            setIsTempTitle(false);
        }
    };

    const handleSubmit = () => {
        if (!url) return;

        const recipe = {
            url: parsedData?.url || url,
            source: parsedData?.source || 'unknown',
            creatorHandle: parsedData?.creatorHandle || creatorName,
            creatorName: creatorName || parsedData?.creatorHandle || '',
            title: title || '제목 없음',
            thumbnail: thumbnail || parsedData?.thumbnail || null, // Use the state thumbnail first
            categories: selectedCategories,
            notes,
            description, // Include the pasted description
            videoId: parsedData?.videoId || null, // Ensure videoId is saved
        };

        onSave(recipe);
        handleClose();
    };

    const handleClose = () => {
        setUrl('');
        setParsedData(null);
        setTitle('');
        setCreatorName('');
        setSelectedCategories([]);
        setNotes('');
        setDescription('');
        setNewCategory('');
        setShowNewCategory(false);
        setIsTempTitle(false);
        setIsLoading(false);
        onClose();
    };

    const toggleCategory = (cat) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    const handleAddNewCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            toggleCategory(newCategory.trim());
            setNewCategory('');
            setShowNewCategory(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>레시피 추가</h2>
                    <button className="modal-close" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* URL Input */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
                            영상 링크
                        </label>
                        <input
                            type="url"
                            placeholder="영상 링크를 붙여넣기 해주세요"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                            {supportedSources.map((source) => (
                                <span
                                    key={source.name}
                                    style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}
                                >
                                    <SourceIcon source={source.name} size={12} /> {source.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {parsedData && (
                        <div
                            style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--color-white)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--spacing-lg)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                                <span className={`source-badge ${parsedData.source}`}><SourceIcon source={parsedData.source} size={14} /></span>
                                <span style={{ fontWeight: 500 }}>{parsedData.sourceLabel}</span>
                                {parsedData.creatorHandle && (
                                    <span style={{ color: 'var(--color-text-light)' }}>{parsedData.creatorHandle}</span>
                                )}
                            </div>
                            {parsedData.thumbnail && (
                                <img
                                    src={
                                        parsedData.source === 'instagram'
                                            ? `https://images.weserv.nl/?url=${encodeURIComponent(parsedData.thumbnail)}&n=-1`
                                            : parsedData.thumbnail
                                    }
                                    alt="Preview"
                                    crossOrigin="anonymous"
                                    style={{
                                        width: '100%',
                                        aspectRatio: '16/9',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-sm)',
                                    }}
                                />
                            )}
                        </div>
                    )}

                    {/* Title */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
                            레시피 제목
                            {isLoading && (
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Loader2 size={12} className="spin" /> 불러오는 중...
                                </span>
                            )}
                            {!isLoading && parsedData && !isTempTitle && title && (
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Sparkles size={12} /> 영상 제목
                                </span>
                            )}
                            {!isLoading && isTempTitle && title && (
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <FileText size={12} /> 임시 제목
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            placeholder="예: 간장계란밥"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onFocus={handleTitleFocus}
                            style={isTempTitle ? { color: 'var(--color-text-muted)' } : {}}
                        />
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                            {isTempTitle ? '👆 터치하면 임시 제목이 삭제돼요' : '원하는 제목으로 수정할 수 있어요'}
                        </p>
                    </div>

                    {/* Creator Name */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
                            크리에이터
                            {parsedData && creatorName === parsedData.creatorHandle && parsedData.creatorHandle && (
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Sparkles size={12} /> 자동 입력됨
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            placeholder="예: @cooking_master"
                            value={creatorName}
                            onChange={(e) => setCreatorName(e.target.value)}
                        />
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                            크리에이터 이름을 수정할 수 있어요
                        </p>
                    </div>

                    {/* Categories */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
                            카테고리
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`chip ${selectedCategories.includes(cat) ? 'active' : ''}`}
                                    onClick={() => toggleCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                            {!showNewCategory ? (
                                <button
                                    type="button"
                                    className="chip"
                                    onClick={() => setShowNewCategory(true)}
                                >
                                    + 추가
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder="새 카테고리"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        style={{ width: '100px', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddNewCategory()}
                                    />
                                    <button type="button" className="chip active" onClick={handleAddNewCategory}>
                                        <Check size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description Import */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
                            영상 설명글 붙여넣기 (선택)
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginLeft: 'var(--spacing-sm)', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Sparkles size={12} /> 재료와 순서를 자동으로 가져와요
                            </span>
                        </label>
                        <textarea
                            placeholder="팁: 영상의 '설명'이나 '더보기' 내용을 복사해서 여기에 붙여넣어주세요."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            style={{ fontSize: 'var(--font-size-sm)' }}
                        />
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
                            메모 (선택)
                        </label>
                        <textarea
                            placeholder="나만의 요리 팁을 적어보세요..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!url}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-md)',
                            fontSize: 'var(--font-size-base)',
                            opacity: url ? 1 : 0.5,
                        }}
                    >
                        저장하기
                    </button>
                </div>
            </div>
        </div>
    );
}
