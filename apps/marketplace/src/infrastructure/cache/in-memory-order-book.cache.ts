import { Injectable } from '@nestjs/common';

import { Order } from '../../domain/aggregates/order.aggregate';
import { OrderBookCache } from './order-book.cache';

@Injectable()
export class InMemoryOrderBookCache implements OrderBookCache {
  private readonly ordersByListing = new Map<string, Map<string, Order>>();

  async add(order: Order): Promise<void> {
    let bucket = this.ordersByListing.get(order.listingId);
    if (!bucket) {
      bucket = new Map<string, Order>();
      this.ordersByListing.set(order.listingId, bucket);
    }
    bucket.set(order.id.value, order);
  }

  async remove(orderId: string): Promise<void> {
    for (const bucket of this.ordersByListing.values()) {
      bucket.delete(orderId);
    }
  }

  async get(listingId: string): Promise<Order[]> {
    const bucket = this.ordersByListing.get(listingId);
    return bucket ? [...bucket.values()] : [];
  }
}
