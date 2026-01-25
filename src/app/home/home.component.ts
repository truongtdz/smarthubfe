import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Category} from '../category/category.model';
import {Product} from '../products/products.model';
import {ProductsService} from '../products/products.service';
import {CategoriesService} from '../category/categories.service';
import {RouterLink} from '@angular/router';
import {User} from '../users/users.model';
import {AuthService} from '../auth/auth.service';
import {CartItem, HomeService, OrderReq} from './home.service';
import {ToastrService} from 'ngx-toastr';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategoryId: number | null = null;
  searchKeyword: string = '';
  isLoading: boolean = false;
  selectedProduct: any = null;

  currentUser: User | null = null;

  cartItems: CartItem[] = [];
  cartItemCount: number = 0;
  itemToDelete: number | null = null;

  initOrderInfo(): OrderReq {return {userId: 0, phone: '', address: '', carts: []}}
  orderInfo: OrderReq = this.initOrderInfo();

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private homeService: HomeService,
    private toast: ToastrService,
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
    this.loadProducts();
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
        this.products = data;
        this.filteredProducts = this.products;
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
          this.products = data;
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
    this.filteredProducts = this.products.filter(product => {
      return !this.selectedCategoryId || product.categoryId === this.selectedCategoryId;
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  openProductDetail(product: any): void {
    this.selectedProduct = product;
  }

  logout(): void {
    this.authService.logout();
  }

  addToCart(product: Product): void {
    this.homeService.addToCart(product);
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

  confirmRemoveItem(productId: number): void {
    this.itemToDelete = productId;
  }

  removeCartItem(): void {
    if (this.itemToDelete !== null) {
      this.homeService.removeFromCart(this.itemToDelete);
      this.itemToDelete = null;
    }
  }

  getCartTotal(): number {
    return this.homeService.getTotal();
  }

  checkout(): void {
    if (!this.orderInfo.phone || !this.orderInfo.address) {
      alert('Vui lòng nhập đầy đủ thông tin giao hàng!');
      return;
    }

    this.orderInfo.userId = this.currentUser?.id || 0;
    this.orderInfo.carts = this.cartItems;

    this.homeService.createOrder(this.orderInfo).subscribe(() =>{
      this.toast.success('Đặt hàng thành công!');
      this.homeService.clearCart();
      this.resetOrderInfo();
      this.closeAllModals();
    });
  }

  resetOrderInfo(): void {
    this.orderInfo = this.initOrderInfo();
  }

  closeAllModals(): void {
    const modals = ['cartModal', 'confirmCheckoutModal'];
    modals.forEach(modalId => {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
    });

    // Xóa backdrop
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  }
}
