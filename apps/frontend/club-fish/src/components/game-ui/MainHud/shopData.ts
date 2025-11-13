export type ShopItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

// Example shop items. Replace or import from a real data source as needed.
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "baseball_hat_red",
    name: "Red Baseball Hat",
    price: 25,
    description: "A stylish baseball hat.",
  },
  {
    id: "baseball_hat_blue",
    name: "Blue Baseball Hat",
    price: 25,
    description: "A stylish baseball hat.",
  },
  {
    id: "top_hat",
    name: "Top Hat",
    price: 30,
    description: "A fancy top hat.",
  },
];
