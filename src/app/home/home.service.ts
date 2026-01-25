// cart.service.ts
import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import { Product } from '../products/products.model';
import {HttpClient} from '@angular/common/http';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderReq {
  userId: number
  phone: string;
  address: string;
  carts: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  constructor(private http: HttpClient) {
  }

  addToCart(product: Product): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
      this.cartItems.next([...currentItems]);
    } else {
      this.cartItems.next([...currentItems, { product, quantity: 1 }]);
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(item => item.product.id === productId);

    if (item) {
      item.quantity = quantity;
      this.cartItems.next([...currentItems]);
    }
  }

  removeFromCart(productId: number): void {
    const currentItems = this.cartItems.value.filter(
      item => item.product.id !== productId
    );
    this.cartItems.next(currentItems);
  }

  clearCart(): void {
    this.cartItems.next([]);
  }

  getTotal(): number {
    return this.cartItems.value.reduce(
      (total, item) => total + (item.product.price! * item.quantity),
      0
    );
  }

  getItemCount(): number {
    return this.cartItems.value.reduce(
      (count, item) => count + item.quantity,
      0
    );
  }

  createOrder(order: OrderReq): Observable<void> {
    return this.http.post<void>('http://localhost:8080/api/orders/upload', order);
  }
}
