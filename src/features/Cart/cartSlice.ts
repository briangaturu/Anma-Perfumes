import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantName?: string;
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
    // 1. Adds items to the cart
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.totalAmount = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },

    // 2. Handles the + and - buttons on the Cart Page
    updateQuantity: (state, action: PayloadAction<{ id: string; change: number }>) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        const newQuantity = item.quantity + action.payload.change;
        // Prevents quantity from going below 1
        if (newQuantity > 0) {
          item.quantity = newQuantity;
        }
      }
      state.totalAmount = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },

    // 3. Removes a specific item from the bag
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.totalAmount = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },

    // 4. Empties the bag (Call this after successful M-Pesa checkout)
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    }
  },
});

// Export all actions so components can dispatch them
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;