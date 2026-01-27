import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService, Order } from '../home/home.service';
import { AuthService } from '../auth/auth.service';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/products.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  products: Map<number, Product> = new Map();
  selectedOrder: Order | null = null;
  isLoading = false;

  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadProducts();
  }

  loadOrders(): void {
    this.isLoading = true;
    const userId = this.authService.getUser()?.id;
    if (userId) {
      this.homeService.getUserOrders(userId).subscribe({
        next: (data) => {
          this.orders = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  loadProducts(): void {
    this.productsService.getAll().subscribe({
      next: (data) => {
        data.forEach(p => this.products.set(p.id!, p));
      }
    });
  }

  getProduct(productId: number | undefined): Product | undefined {
    if (productId === undefined) {
      return undefined;
    }
    return this.products.get(productId);
  }

  viewOrderDetail(order: Order): void {
    this.selectedOrder = order;
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) {
      return '';
    }
    return new Date(dateStr).toLocaleString('vi-VN');
  }
}
