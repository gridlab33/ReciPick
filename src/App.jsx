import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';

// Components
import { BottomNav } from './components/BottomNav';
import { AddRecipeModal } from './components/AddRecipeModal';

// Pages
import { HomePage } from './pages/HomePage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SavedPage } from './pages/SavedPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const {
    recipes,
    customCategories,
    shoppingList,
    isLoaded,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipeById,
    addCategory,
    deleteCategory,
    getStats,
    getCreators,
    addToShoppingList,
    removeFromShoppingList,
    toggleShoppingItem,
    clearCompletedShoppingItems,
    toggleFavorite,
    settings,
    updateSettings,
  } = useLocalStorage();

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setCurrentPage('detail');
  };

  const handleBackFromDetail = () => {
    setSelectedRecipe(null);
    setCurrentPage('home');
  };

  const handleSaveRecipe = (recipeData) => {
    addRecipe(recipeData);
    setIsAddModalOpen(false);
  };

  const handleNavigate = (page) => {
    setSelectedRecipe(null);
    setCurrentPage(page);
  };

  // Show loading state
  if (!isLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--color-background)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={48} className="spin" color="var(--color-primary)" />
          </div>
          <p style={{ color: 'var(--color-text-light)' }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            recipes={recipes}
            stats={getStats()}
            onRecipeClick={handleRecipeClick}
          />
        );
      case 'detail':
        return (
          <RecipeDetailPage
            recipe={selectedRecipe}
            onBack={handleBackFromDetail}
            onUpdate={updateRecipe}
            onDelete={deleteRecipe}
            onAddToShoppingList={addToShoppingList}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'categories':
        return (
          <CategoriesPage
            recipes={recipes}
            customCategories={customCategories}
            creators={getCreators()}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
            onSourceClick={(source) => {
              // TODO: Filter by source
              setCurrentPage('home');
            }}
            onCategoryClick={(category) => {
              // TODO: Filter by category
              setCurrentPage('home');
            }}
            onCreatorClick={(creator) => {
              // TODO: Filter by creator
              setCurrentPage('home');
            }}
          />
        );
      case 'favorites':
        return (
          <SavedPage
            recipes={recipes}
            onRecipeClick={handleRecipeClick}
            shoppingList={shoppingList}
            onToggleShoppingItem={toggleShoppingItem}
            onRemoveShoppingItem={removeFromShoppingList}
            onClearCompleted={clearCompletedShoppingItems}
            settings={settings}
            creators={getCreators()}
          />
        );
      case 'settings':
        return <SettingsPage settings={settings} updateSettings={updateSettings} />;
      default:
        return (
          <HomePage
            recipes={recipes}
            stats={getStats()}
            onRecipeClick={handleRecipeClick}
          />
        );
    }
  };

  return (
    <>


      {renderPage()}
      <BottomNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <AddRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveRecipe}
        categories={customCategories}
        settings={settings}
      />
    </>
  );
}

export default App;
