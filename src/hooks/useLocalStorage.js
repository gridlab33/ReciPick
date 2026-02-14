import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recipe-scrapbook-data';

const defaultData = {
    recipes: [],
    customCategories: ['한식', '양식', '중식', '일식', '반찬', '디저트', '음료'],
    shoppingList: [],
    settings: {
        coupangPartnersId: 'AF6320349',
        youtubeApiKey: '', // Optional: YouTube Data API v3 key for faster metadata fetching
    },
};

// Helper: Generate UUID (fallback for non-secure contexts)
function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function useLocalStorage() {
    const [data, setData] = useState(defaultData);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load data from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setData({ ...defaultData, ...parsed });
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
        setIsLoaded(true);
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch (error) {
                console.error('Failed to save data:', error);
            }
        }
    }, [data, isLoaded]);

    // Settings operations
    const updateSettings = useCallback((newSettings) => {
        setData((prev) => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings },
        }));
    }, []);

    // Recipe operations
    const addRecipe = useCallback((recipe) => {
        const newRecipe = {
            ...recipe,
            id: generateId(),
            savedAt: new Date().toISOString(),
        };
        setData((prev) => ({
            ...prev,
            recipes: [newRecipe, ...prev.recipes],
        }));
        return newRecipe;
    }, []);

    const updateRecipe = useCallback((id, updates) => {
        setData((prev) => ({
            ...prev,
            recipes: prev.recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
    }, []);

    const deleteRecipe = useCallback((id) => {
        setData((prev) => ({
            ...prev,
            recipes: prev.recipes.filter((r) => r.id !== id),
        }));
    }, []);

    const toggleFavorite = useCallback((id) => {
        setData((prev) => ({
            ...prev,
            recipes: prev.recipes.map((r) =>
                r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
            ),
        }));
    }, []);

    const getRecipeById = useCallback(
        (id) => data.recipes.find((r) => r.id === id),
        [data.recipes]
    );

    // Category operations
    const addCategory = useCallback((categoryName) => {
        setData((prev) => {
            if (prev.customCategories.includes(categoryName)) return prev;
            return {
                ...prev,
                customCategories: [...prev.customCategories, categoryName],
            };
        });
    }, []);

    const deleteCategory = useCallback((categoryName) => {
        setData((prev) => ({
            ...prev,
            customCategories: prev.customCategories.filter((c) => c !== categoryName),
            recipes: prev.recipes.map((r) => ({
                ...r,
                categories: r.categories?.filter((c) => c !== categoryName) || [],
            })),
        }));
    }, []);

    // Shopping list operations
    const addToShoppingList = useCallback((items) => {
        // items: [{ name, amount, unit, emoji, recipeId, recipeTitle }]
        setData((prev) => {
            const newItems = items.map((item) => ({
                ...item,
                id: generateId(),
                addedAt: new Date().toISOString(),
                completed: false,
            }));
            return {
                ...prev,
                shoppingList: [...newItems, ...prev.shoppingList],
            };
        });
    }, []);

    const removeFromShoppingList = useCallback((id) => {
        setData((prev) => ({
            ...prev,
            shoppingList: prev.shoppingList.filter((item) => item.id !== id),
        }));
    }, []);

    const toggleShoppingItem = useCallback((id) => {
        setData((prev) => ({
            ...prev,
            shoppingList: prev.shoppingList.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            ),
        }));
    }, []);

    const clearCompletedShoppingItems = useCallback(() => {
        setData((prev) => ({
            ...prev,
            shoppingList: prev.shoppingList.filter((item) => !item.completed),
        }));
    }, []);

    // Filter functions
    const getRecipesBySource = useCallback(
        (source) => {
            if (!source || source === 'all') return data.recipes;
            return data.recipes.filter((r) => r.source === source);
        },
        [data.recipes]
    );

    const getRecipesByCategory = useCallback(
        (category) => {
            return data.recipes.filter((r) => r.categories?.includes(category));
        },
        [data.recipes]
    );

    const getRecipesByCreator = useCallback(
        (creatorHandle) => {
            return data.recipes.filter((r) => r.creatorHandle === creatorHandle);
        },
        [data.recipes]
    );

    // Stats
    const getStats = useCallback(() => {
        const sources = { instagram: 0, youtube: 0, tiktok: 0, naver: 0 };
        const creators = {};

        (data.recipes || []).forEach((r) => {
            if (r.source && sources[r.source] !== undefined) {
                sources[r.source]++;
            }
            if (r.creatorHandle) {
                creators[r.creatorHandle] = (creators[r.creatorHandle] || 0) + 1;
            }
        });

        return {
            total: (data.recipes || []).length,
            sources,
            topCreators: Object.entries(creators)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([handle, count]) => ({ handle, count })),
        };
    }, [data.recipes]);

    // Get unique creators
    const getCreators = useCallback(() => {
        const creatorsMap = {};
        (data.recipes || []).forEach((r) => {
            if (r.creatorHandle && !creatorsMap[r.creatorHandle]) {
                creatorsMap[r.creatorHandle] = {
                    handle: r.creatorHandle,
                    name: r.creatorName || r.creatorHandle,
                    source: r.source,
                    count: 0,
                };
            }
            if (r.creatorHandle) {
                creatorsMap[r.creatorHandle].count++;
            }
        });
        return Object.values(creatorsMap).sort((a, b) => b.count - a.count);
    }, [data.recipes]);

    return {
        recipes: data.recipes,
        customCategories: data.customCategories,
        shoppingList: data.shoppingList,
        isLoaded,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        toggleFavorite,
        getRecipeById,
        addCategory,
        deleteCategory,
        getRecipesBySource,
        getRecipesByCategory,
        getRecipesByCreator,
        getStats,
        getCreators,
        addToShoppingList,
        removeFromShoppingList,
        toggleShoppingItem,
        clearCompletedShoppingItems,
        settings: data.settings || defaultData.settings,
        updateSettings,
    };
}
