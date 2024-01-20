import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
    name: "ui",
    initialState: { cartOpened: false, favOpened: false, likedItems: [], bgColorChange: false },
    reducers: {
        toggle(state, action) {
            state[action.payload] = !state[action.payload];
        },
        heartLikeStatusToggle(state, action) {
            const newLikedItem = action.payload;
            const existingLikedItem = state.likedItems.find(item => item.likedId === newLikedItem.id);
            if (!existingLikedItem) {
                state.likedItems.push({
                    likedId: newLikedItem.id,
                    isLiked: true,
                })
            } else {
                existingLikedItem.isLiked = !existingLikedItem.isLiked;
            }
        },
        heroButtonClicked(state, action) {
            state[action.payload] = !state[action.payload];
        }
    },
});

export const uiActions = uiSlice.actions;

export default uiSlice;