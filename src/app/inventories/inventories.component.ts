import { Component, OnInit } from '@angular/core';
import { Product } from '../products/products.model';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../category/categories.service';
import { Category } from '../category/category.model';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

declare var bootstrap: any;

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [NgForOf, NgIf, FormsModule, NgClass],
  templateUrl: './inventories.component.html',
  styleUrl: './inventories.component.scss',
})
export class InventoriesComponent implements OnInit {

  products: Product[] = [];
  categories: Category[] = [];
  categoryMap: Map<number, string> = new Map();

  searchKeyword = '';
  currentProduct?: Product;
  newStock: number = 0;

  private stockModal: any;

  constructor(
    private productService: ProductsService,
    private categoryService: CategoriesService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: data => {
        this.categories = data;
        this.categoryMap = new Map(data.map(c => [c.id!, c.name]));
        this.loadProducts();
      }
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: data => this.products = data,
      error: err => this.toast.error(err.error || 'Không tải được sản phẩm')
    });
  }

  getCategoryName(categoryId: number): string {
    return this.categoryMap.get(categoryId) || 'N/A';
  }

  search(): void {
    if (!this.searchKeyword.trim()) {
      this.loadProducts();
      return;
    }

    this.productService.search(this.searchKeyword).subscribe({
      next: data => this.products = data
    });
  }

  openStockModal(product: Product): void {
    this.currentProduct = { ...product };
    this.newStock = product.stock || 0;
    this.openModal('stockModal');
  }

  updateStock(): void {
    if (!this.currentProduct?.id) return;

    if (this.newStock < 0) {
      this.toast.error('Số lượng tồn kho không được âm');
      return;
    }

    const updatedProduct = {
      ...this.currentProduct,
      stock: this.newStock
    };

    this.productService.update(this.currentProduct.id, updatedProduct).subscribe({
      next: () => {
        this.toast.success('Cập nhật tồn kho thành công');
        this.closeModal('stockModal');
        this.loadProducts();
      },
      error: err => {
        this.toast.error(err.error || 'Cập nhật thất bại');
      }
    });
  }

  getStockStatus(stock?: number): string {
    if (!stock || stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  getStockBadgeClass(stock?: number): string {
    if (!stock || stock === 0) return 'bg-danger';
    if (stock < 10) return 'bg-warning';
    return 'bg-success';
  }

  private openModal(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    const modal = new bootstrap.Modal(el);
    modal.show();
    this.stockModal = modal;
  }

  private closeModal(id: string): void {
    this.stockModal?.hide();
  }
}
