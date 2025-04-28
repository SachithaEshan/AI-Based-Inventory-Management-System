export interface IOrder {
  _id: string;
  user: string;
  seller: string;
  product: string;
  sellerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
} 