import { useState } from "react";
import { TabBar } from "./components/TabBar";
import { Login } from "./components/screens/Login";
import { Home } from "./components/screens/Home";
import { SearchResults } from "./components/screens/SearchResults";
import { ProductDetails } from "./components/screens/ProductDetails";
import { Watchlist } from "./components/screens/Watchlist";
import { ShoppingList } from "./components/screens/ShoppingList";
import { Notifications } from "./components/screens/Notifications";
import { Settings } from "./components/screens/Settings";

type Screen = 
  | 'login'
  | 'home'
  | 'search-results'
  | 'product-details'
  | 'watchlist'
  | 'list'
  | 'notifications'
  | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentTab, setCurrentTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  
  // App state
  const [watchlistItems, setWatchlistItems] = useState<Array<{
    id: string;
    name: string;
    price: string;
    badge?: string;
  }>>([]);
  
  const [shoppingListItems, setShoppingListItems] = useState<Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
  }>>([]);

  const handleLogin = () => {
    setCurrentScreen('home');
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setCurrentScreen(tab as Screen);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentScreen('search-results');
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentScreen('product-details');
  };

  const handleBack = () => {
    if (currentScreen === 'search-results') {
      setCurrentScreen('home');
    } else if (currentScreen === 'product-details') {
      setCurrentScreen('home');
    }
  };

  const handleAddToWatchlist = () => {
    const newItem = {
      id: selectedProductId,
      name: "Milk 2L",
      price: "$2.90",
      badge: "Price drop"
    };
    setWatchlistItems(prev => [...prev, newItem]);
    setCurrentScreen('watchlist');
    setCurrentTab('watchlist');
  };

  const handleAddToShoppingList = () => {
    const newItem = {
      id: selectedProductId,
      name: "Milk 2L", 
      price: "$2.90",
      quantity: 1
    };
    setShoppingListItems(prev => [...prev, newItem]);
    setCurrentScreen('list');
    setCurrentTab('list');
  };

  const handleRemoveFromWatchlist = (productId: string) => {
    setWatchlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setShoppingListItems(prev => prev.filter(item => item.id !== productId));
    } else {
      setShoppingListItems(prev => 
        prev.map(item => 
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleLogout = () => {
    setCurrentScreen('login');
    setWatchlistItems([]);
    setShoppingListItems([]);
  };

  const showTabBar = currentScreen !== 'login' && 
                     currentScreen !== 'search-results' && 
                     currentScreen !== 'product-details';

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      
      case 'home':
        return (
          <Home 
            onSearch={handleSearch}
            onProductSelect={handleProductSelect}
          />
        );
      
      case 'search-results':
        return (
          <SearchResults
            query={searchQuery}
            onProductSelect={handleProductSelect}
            onBack={handleBack}
          />
        );
      
      case 'product-details':
        return (
          <ProductDetails
            productId={selectedProductId}
            onBack={handleBack}
            onAddToWatchlist={handleAddToWatchlist}
            onAddToList={handleAddToShoppingList}
          />
        );
      
      case 'watchlist':
        return (
          <Watchlist
            items={watchlistItems}
            onProductSelect={handleProductSelect}
            onRemoveItem={handleRemoveFromWatchlist}
          />
        );
      
      case 'list':
        return (
          <ShoppingList
            items={shoppingListItems}
            onProductSelect={handleProductSelect}
            onQuantityChange={handleQuantityChange}
            onShare={() => {}}
            onClear={() => setShoppingListItems([])}
          />
        );
      
      case 'notifications':
        return <Notifications />;
      
      case 'settings':
        return <Settings onLogout={handleLogout} />;
      
      default:
        return <Home onSearch={handleSearch} onProductSelect={handleProductSelect} />;
    }
  };

  return (
    <div className="w-[390px] h-[844px] mx-auto bg-gray-100 relative overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {renderScreen()}
        </div>
        
        {showTabBar && (
          <TabBar 
            activeTab={currentTab}
            onTabChange={handleTabChange}
          />
        )}
      </div>
    </div>
  );
}
