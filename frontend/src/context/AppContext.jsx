import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  items: [],
  categories: [],
  sales: [],
  loading: false,
  error: null
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload, loading: false };
    
    case 'SET_SALES':
      return { ...state, sales: action.payload, loading: false };
    
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload._id ? action.payload : item
        )
      };
    
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload)
      };
    
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category._id === action.payload._id ? action.payload : category
        )
      };
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category._id !== action.payload)
      };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};