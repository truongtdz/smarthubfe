import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Category} from '../category/category.model';
import {Product} from '../products/products.model';
import {ProductsService} from '../products/products.service';
import {CategoriesService} from '../category/categories.service';
import {Router, RouterLink} from '@angular/router';
import {User} from '../users/users.model';
import {AuthService} from '../auth/auth.service';
import {CartItem, HomeService, Order} from './home.service';
import {ToastrService} from 'ngx-toastr';
import {FormsModule} from '@angular/forms';
import {ChatBoxComponent} from '../chat-box/chat-box.component';
import {PaymentService} from '../payment/payment.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ChatBoxComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  products: Map<number, Product> = new Map();
  filteredProducts: Product[] = [];
  allProducts: Product[] = [];
  selectedCategoryId: number | null = null;
  searchKeyword: string = '';
  isLoading: boolean = false;
  selectedProduct: any = null;

  currentUser: User | null = null;

  cartItems: CartItem[] = [];
  cartItemCount: number = 0;
  itemToDelete: number | null = null;

  orders: Order[] = [];
  selectedOrder: Order | null = null;
  isLoadingOrders = false;

  showProductDetailModal = false;
  showCartModal = false;
  showConfirmDeleteModal = false;
  showConfirmCheckoutModal = false;
  showOrderHistoryModal = false;
  showOrderDetailModal = false;

  disableCheckout = true;

  initOrderInfo(): Order {
    return {userId: 0, phone: '', address: '', orderItems: [], createdAt: '', totalAmount: 0, status: 0, isConfirm: 0};
  }

  orderInfo: Order = this.initOrderInfo();

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private homeService: HomeService,
    private toast: ToastrService,
    private router: Router,
    private paymentService: PaymentService
  ) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.orderInfo.phone = user.phone || '';
        this.orderInfo.address = user.address || '';
      }
    });
    this.homeService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartItemCount = this.homeService.getItemCount();
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts()
    this.disableCheckout = true;
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productsService.getAll().subscribe({
      next: (data) => {
        data.forEach(p => this.products.set(p.id!, p));
        this.filteredProducts = data;
        this.allProducts = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.applyFilters();
  }

  searchProducts(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchKeyword = input.value;

    if (this.searchKeyword.trim()) {
      this.isLoading = true;
      this.productsService.search(this.searchKeyword).subscribe({
        next: (data) => {
          data.forEach(p => this.products.set(p.id!, p));
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error searching products:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.loadProducts();
    }
  }

  applyFilters(): void {
    const productsArray = Array.from(this.products.values());
    this.filteredProducts = productsArray.filter(product => {
      return !this.selectedCategoryId || product.categoryId === this.selectedCategoryId;
    });
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

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth'])
      .then(item => this.toast.success('Đăng xuất thành công!'));
  }

  updateCartQuantity(productId: number, event: Event): void {
    const target = event.target as HTMLElement;
    const button = target.closest('button');

    if (button && button.hasAttribute('data-quantity')) {
      const quantity = parseInt(button.getAttribute('data-quantity')!);
      if (quantity > 0) {
        this.homeService.updateQuantity(productId, quantity);
      }
    } else {
      const input = event.target as HTMLInputElement;
      const quantity = parseInt(input.value);
      if (quantity > 0) {
        this.homeService.updateQuantity(productId, quantity);
      }
    }
  }

  getCartTotal(): number {
    return this.homeService.getTotal();
  }

  checkout(): void {
    if (!this.orderInfo.phone || !this.orderInfo.address) {
      this.toast.error('Vui lòng nhập đầy đủ thông tin giao hàng!');
      return;
    }

    const phoneRegex = /^(0|\+84)[0-9]{9}$/;

    if (!phoneRegex.test(this.orderInfo.phone)) {
      this.toast.error('Số điện thoại không hợp lệ!');
      return;
    }

    this.orderInfo.userId = this.currentUser?.id || 0;
    this.orderInfo.orderItems = this.cartItems;
    this.orderInfo.status = 0;

    this.disableCheckout = false;
    this.homeService.createOrder(this.orderInfo).subscribe(() => {
      this.toast.success('Đặt hàng thành công!');
      this.homeService.clearCart();
      this.resetOrderInfo();
      this.closeAllModals();
      this.showConfirmCheckoutModal = false;
    });
  }

  resetOrderInfo(): void {
    this.orderInfo = this.initOrderInfo();
  }

  loadOrders(): void {
    this.isLoadingOrders = true;
    const userId = this.currentUser?.id;
    if (userId) {
      this.homeService.getUserOrders(userId).subscribe({
        next: (data) => {
          this.orders = data;
          this.isLoadingOrders = false;
        },
        error: () => {
          this.isLoadingOrders = false;
        }
      });
    }
  }

  getProductFromMap(productId: number | undefined): Product | undefined {
    if (productId === undefined) {
      return undefined;
    }
    return this.products.get(productId);
  }

  formatOrderDate(dateStr: string | undefined): string {
    if (!dateStr) {
      return '';
    }
    return new Date(dateStr).toLocaleString('vi-VN');
  }

  processPayment(order: Order): void {
    const amount = order.totalAmount;
    const orderId = order.id || 0;
    this.paymentService.createPayment(amount, orderId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 'OK' && response.url) {
            window.location.href = response.url;
          } else {
            this.toast.error(response.message || 'Có lỗi xảy ra');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toast.error('Không thể kết nối đến server. Vui lòng thử lại.');
          console.error('Payment error:', error);
        }
      });
  }

  openProductDetail(product: any): void {
    this.selectedProduct = product;
    this.showProductDetailModal = true;
  }

  addToCart(product: Product): void {
    this.homeService.addToCart(product);
    this.showProductDetailModal = false;
  }

  openOrderHistory(): void {
    this.loadOrders();
    this.showOrderHistoryModal = true;
  }

  viewOrderDetail(order: any): void {
    this.selectedOrder = order;
    this.showOrderDetailModal = true;
  }

  openConfirmCheckout(): void {
    this.showCartModal = false;
    this.showConfirmCheckoutModal = true;
    this.disableCheckout = true;
  }

  cancelCheckout(): void {
    this.showConfirmCheckoutModal = false;
    this.showCartModal = true;
  }

  closeAllModals(): void {
    this.showCartModal = false;
    this.showConfirmCheckoutModal = false;
  }

  confirmRemoveItem(productId: number): void {
    this.itemToDelete = productId;
    this.showConfirmDeleteModal = true;
  }

  removeCartItem(): void {
    if (this.itemToDelete !== null) {
      this.homeService.removeFromCart(this.itemToDelete);
      this.itemToDelete = null;
    }
    this.showConfirmDeleteModal = false;
  }

  handleViewDetail(product: any): void {
    this.selectedProduct = product;
    this.showProductDetailModal = true;
  }

}
