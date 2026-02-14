/**
 * Recipe Generator Utility
 * Generates dummy recipe data (ingredients + steps) based on recipe title/category
 * This simulates automatic recipe fetching - can be replaced with real API later
 */

const RECIPE_TEMPLATES = {
    한식: {
        ingredients: [
            { name: '쌀', amount: '2', unit: '컵', emoji: '🍚' },
            { name: '간장', amount: '3', unit: '큰술', emoji: '🫗' },
            { name: '참기름', amount: '1', unit: '큰술', emoji: '🫒' },
            { name: '마늘', amount: '3', unit: '쪽', emoji: '🧄' },
            { name: '파', amount: '2', unit: '대', emoji: '🧅' },
            { name: '고추장', amount: '2', unit: '큰술', emoji: '🌶️' },
            { name: '설탕', amount: '1', unit: '큰술', emoji: '🍬' },
            { name: '깨소금', amount: '1', unit: '작은술', emoji: '✨' },
        ],
        steps: [
            '재료를 깨끗이 씻어 준비합니다.',
            '양념장을 만들어 줍니다.',
            '팬에 기름을 두르고 중불로 예열합니다.',
            '재료를 넣고 잘 볶아줍니다.',
            '양념장을 넣고 골고루 섞어줍니다.',
            '약불에서 5분간 더 조리합니다.',
            '그릇에 담고 깨소금을 뿌려 완성합니다.',
        ],
    },
    양식: {
        ingredients: [
            { name: '파스타면', amount: '200', unit: 'g', emoji: '🍝' },
            { name: '올리브오일', amount: '3', unit: '큰술', emoji: '🫒' },
            { name: '마늘', amount: '4', unit: '쪽', emoji: '🧄' },
            { name: '양파', amount: '1', unit: '개', emoji: '🧅' },
            { name: '토마토소스', amount: '200', unit: 'ml', emoji: '🍅' },
            { name: '파르메산치즈', amount: '30', unit: 'g', emoji: '🧀' },
            { name: '소금', amount: '1', unit: '작은술', emoji: '🧂' },
            { name: '후추', amount: '약간', unit: '', emoji: '🌶️' },
            { name: '바질', amount: '5', unit: '잎', emoji: '🌿' },
        ],
        steps: [
            '끓는 물에 소금을 넣고 파스타면을 삶아줍니다.',
            '마늘과 양파를 잘게 다져 준비합니다.',
            '팬에 올리브오일을 두르고 마늘을 볶아 향을 냅니다.',
            '양파를 넣고 투명해질 때까지 볶아줍니다.',
            '토마토소스를 넣고 중불에서 5분간 끓입니다.',
            '삶은 파스타면을 소스에 넣고 잘 섞어줍니다.',
            '파르메산치즈와 바질을 올려 완성합니다.',
        ],
    },
    중식: {
        ingredients: [
            { name: '돼지고기', amount: '200', unit: 'g', emoji: '🥩' },
            { name: '양파', amount: '1', unit: '개', emoji: '🧅' },
            { name: '피망', amount: '1', unit: '개', emoji: '🫑' },
            { name: '전분', amount: '2', unit: '큰술', emoji: '🥄' },
            { name: '간장', amount: '2', unit: '큰술', emoji: '🫗' },
            { name: '식초', amount: '1', unit: '큰술', emoji: '🍶' },
            { name: '설탕', amount: '2', unit: '큰술', emoji: '🍬' },
            { name: '식용유', amount: '적당량', unit: '', emoji: '🫗' },
        ],
        steps: [
            '돼지고기를 한입 크기로 잘라 전분을 묻혀줍니다.',
            '야채를 큼직하게 잘라 준비합니다.',
            '소스 재료를 미리 섞어 놓습니다.',
            '기름에 고기를 바삭하게 튀겨줍니다.',
            '팬에 야채를 살짝 볶아줍니다.',
            '소스를 넣고 걸쭉해질 때까지 끓입니다.',
            '튀긴 고기를 넣고 소스와 잘 버무려 완성합니다.',
        ],
    },
    일식: {
        ingredients: [
            { name: '연어', amount: '200', unit: 'g', emoji: '🐟' },
            { name: '밥', amount: '1', unit: '공기', emoji: '🍚' },
            { name: '간장', amount: '2', unit: '큰술', emoji: '🫗' },
            { name: '와사비', amount: '1', unit: '작은술', emoji: '🟢' },
            { name: '김', amount: '2', unit: '장', emoji: '🟫' },
            { name: '단무지', amount: '50', unit: 'g', emoji: '💛' },
            { name: '생강', amount: '1', unit: '조각', emoji: '🫚' },
        ],
        steps: [
            '연어를 신선하게 준비하여 얇게 썰어줍니다.',
            '밥을 따뜻하게 지어줍니다.',
            '간장과 와사비를 섞어 소스를 만듭니다.',
            '그릇에 밥을 담고 위에 연어를 올립니다.',
            '김과 단무지를 곁들여 완성합니다.',
        ],
    },
    default: {
        ingredients: [
            { name: '주재료', amount: '200', unit: 'g', emoji: '🥘' },
            { name: '양파', amount: '1', unit: '개', emoji: '🧅' },
            { name: '마늘', amount: '3', unit: '쪽', emoji: '🧄' },
            { name: '소금', amount: '1', unit: '작은술', emoji: '🧂' },
            { name: '후추', amount: '약간', unit: '', emoji: '🌶️' },
            { name: '식용유', amount: '2', unit: '큰술', emoji: '🫗' },
        ],
        steps: [
            '재료를 준비하고 손질합니다.',
            '양념 재료를 미리 섞어 놓습니다.',
            '팬을 예열하고 기름을 둡니다.',
            '재료를 넣고 조리합니다.',
            '양념을 넣고 잘 섞어줍니다.',
            '그릇에 담아 완성합니다.',
        ],
    },
};

/**
 * Generate recipe data based on recipe info
 * @param {Object} recipe - Recipe object with title, categories, source, description
 * @returns {{ ingredients: Array, steps: Array }}
 */
export function generateRecipeData(recipe) {
    if (!recipe) return RECIPE_TEMPLATES.default;

    // 1. If description is provided, try to parse it
    if (recipe.description) {
        const parsed = parseDescription(recipe.description);
        if (parsed.ingredients.length > 0 || parsed.steps.length > 0) {
            // Merge with defaults if empty
            return {
                ingredients: parsed.ingredients.length > 0 ? parsed.ingredients : RECIPE_TEMPLATES.default.ingredients,
                steps: parsed.steps.length > 0 ? parsed.steps : RECIPE_TEMPLATES.default.steps
            };
        }
    }

    // 2. Try to match a category
    const categories = recipe.categories || [];
    for (const cat of categories) {
        if (RECIPE_TEMPLATES[cat]) {
            return RECIPE_TEMPLATES[cat];
        }
    }

    // 3. Try to infer from title keywords
    const title = (recipe.title || '').toLowerCase();
    if (title.includes('파스타') || title.includes('스테이크') || title.includes('피자') || title.includes('리조또')) {
        return RECIPE_TEMPLATES['양식'];
    }
    if (title.includes('짜장') || title.includes('짬뽕') || title.includes('탕수육') || title.includes('마라')) {
        return RECIPE_TEMPLATES['중식'];
    }
    if (title.includes('초밥') || title.includes('라멘') || title.includes('우동') || title.includes('돈카츠')) {
        return RECIPE_TEMPLATES['일식'];
    }
    if (title.includes('김치') || title.includes('비빔') || title.includes('불고기') || title.includes('찌개') || title.includes('볶음')) {
        return RECIPE_TEMPLATES['한식'];
    }

    return RECIPE_TEMPLATES.default;
}

/**
 * Simple parser to extract ingredients and steps from text description
 * @param {string} text 
 * @returns {{ ingredients: Array, steps: Array }}
 */
function parseDescription(text) {
    if (!text) return { ingredients: [], steps: [] };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const ingredients = [];
    const steps = [];

    // Simple heuristic: 
    // - Look for section headers (Optional)
    // - Numbered lines -> Steps
    // - Lines with quantities or special chars -> Ingredients (if not numbered)
    // - Or just split by headers

    let section = 'unknown'; // 'unknown', 'ingredients', 'steps'

    for (const line of lines) {
        // 1. Detect Headers
        if (line.match(/^(재료|Ingredients|준비물|쇼핑|필요한|Material)/i)) {
            section = 'ingredients';
            continue;
        }
        if (line.match(/^(조리|순서|만드는|방법|Steps|How to|Recipe|과정)/i)) {
            section = 'steps';
            continue;
        }

        // 2. Detect Content based on Section
        if (section === 'ingredients') {
            // Try to parse: "Name Amount"
            // For now, just take the whole line
            ingredients.push({
                name: line.replace(/^[-•*]\s*/, ''), // Remove bullet points
                amount: '',
                unit: '',
                emoji: '🥗' // Default emoji
            });
        } else if (section === 'steps') {
            steps.push(line.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, ''));
        } else {
            // 3. Implicit Detection (if no headers found yet)
            if (line.match(/^\d+\./)) {
                section = 'steps';
                steps.push(line.replace(/^\d+\.\s*/, ''));
            } else if (line.match(/^[-\u2022*]\s/)) {
                // Bullet points in unknown section -> likely ingredients if not numbered
                // But could be unordered steps.
                // Let's assume ingredients if short?
                if (line.length < 30) {
                    ingredients.push({
                        name: line.replace(/^[-•*]\s*/, ''),
                        amount: '',
                        unit: '',
                        emoji: '🥗'
                    });
                } else {
                    steps.push(line.replace(/^[-•*]\s*/, ''));
                }
            }
        }
    }

    // Fallback: If no ingredients found but text exists, maybe it's mixed?
    // User often pastes just the ingredients part or just the steps.
    // We can't be too smart here without risks. 
    // Just return what we found.

    return { ingredients, steps };
}

/**
 * Generate Coupang search URL for an ingredient
 * @param {string} ingredientName
 * @param {string} [partnersId] - Optional Coupang Partners ID (e.g., AF1234567)
 * @returns {string}
 */
export function getCoupangSearchUrl(ingredientName, partnersId) {
    let url = `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(ingredientName)}`;
    if (partnersId) {
        url += `&channel=user&trackId=${partnersId}`;
    }
    return url;
}
