import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantName?: string;
  branchId: string;   
  branchName: string; 
  cartItemId: string; 
  // ADD THIS: Ensure stock is tracked in the state
  countInStock: number; 
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "cartItemId">>) => {
      const uniqueId = `${action.payload.id}-${action.payload.branchId}`;
      const existingItem = state.items.find((item) => item.cartItemId === uniqueId);
      
      if (existingItem) {
        // Validation: Only add if we don't exceed stock
        const potentialQty = existingItem.quantity + action.payload.quantity;
        existingItem.quantity = Math.min(potentialQty, action.payload.countInStock);
      } else {
        state.items.push({ 
          ...action.payload, 
          cartItemId: uniqueId 
        });
      }
      state.totalAmount = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },

    updateQuantity: (state, action: PayloadAction<{ cartItemId: string; change: number }>) => {
      const item = state.items.find((i) => i.cartItemId === action.payload.cartItemId);
      if (item) {
        const newQuantity = item.quantity + action.payload.change;
        
        // CHECK: 
        // 1. Must be at least 1
        // 2. Must not exceed the item's stock (if stock is provided)
        const maxStock = item.countInStock || 999; // Fallback to 999 if missing
        
        if (newQuantity > 0 && newQuantity <= maxStock) {
          item.quantity = newQuantity;
        }
      }
      state.totalAmount = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.cartItemId !== action.payload);
      state.totalAmount = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    }
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;