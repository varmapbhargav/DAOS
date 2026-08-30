import { Order } from '../../domain/aggregates/order.aggregate';

export interface OrderBookCache {
  add(order: Order): Promise<void>;
  remove(orderId: string): Promise<void>;
  get(listingId: string): Promise<Order[]>;
}
