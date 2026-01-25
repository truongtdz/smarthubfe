import { Component, OnInit } from '@angular/core';
import { Product } from './products.model';
import { ProductsService } from './products.service';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CategoriesService } from "../category/categories.service";
import { Category } from "../category/category.model";

declare var bootstrap: any;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [NgForOf, NgIf, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {

  products: Product[] = [];
  categories: Category[] = [];

  searchKeyword = '';
  isEditMode = false;
  currentProductId?: number;
  productToDelete?: Product;

  currentProduct: Product = {
    name: '',
    categoryId: 0
  };

  private productModal: any;
  private deleteModal: any;

  selectedFile?: File;
  previewUrl?: string;
  isUploading = false;

  constructor(
    private productService: ProductsService,
    private categoryService: CategoriesService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: data => this.products = data,
      error: err => this.toast.error(err.error || 'Không tải được sản phẩm')
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: data => this.categories = data
    });
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

  openAddModal(): void {
    this.isEditMode = false;
    this.currentProduct = { name: '', categoryId: 0 };
    this.resetImageState();
    this.openModal('productModal');
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.currentProductId = product.id;
    this.currentProduct = { ...product };
    this.previewUrl = product.imageUrl;
    this.selectedFile = undefined;
    this.openModal('productModal');
  }
  async save(): Promise<void> {
    if (!this.currentProduct.name || !this.currentProduct.categoryId) {
      this.toast.error('Tên và danh mục là bắt buộc');
      return;
    }

    if (this.selectedFile) {
      const imageUrl = await this.uploadImage();
      if (imageUrl) {
        this.currentProduct.imageUrl = imageUrl;
      }
    }

    if (this.isEditMode && this.currentProductId) {
      this.productService.update(this.currentProductId, this.currentProduct).subscribe(() => {
        this.toast.success('Cập nhật thành công');
        this.closeModal('productModal');
        this.loadProducts();
      });
    } else {
      this.productService.create(this.currentProduct).subscribe(() => {
        this.toast.success('Thêm sản phẩm thành công');
        this.closeModal('productModal');
        this.loadProducts();
      });
    }
  }

  private resetImageState(): void {
    this.selectedFile = undefined;
    this.previewUrl = undefined;
  }

  openDeleteModal(product: Product): void {
    this.productToDelete = product;
    this.openModal('deleteModal');
  }

  confirmDelete(): void {
    if (!this.productToDelete?.id) return;

    this.productService.delete(this.productToDelete.id).subscribe(() => {
      this.toast.success('Xóa thành công');
      this.closeModal('deleteModal');
      this.loadProducts();
    });
  }

  private openModal(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    const modal = new bootstrap.Modal(el);
    modal.show();
    id === 'productModal' ? this.productModal = modal : this.deleteModal = modal;
  }

  private closeModal(id: string): void {
    id === 'productModal'
      ? this.productModal?.hide()
      : this.deleteModal?.hide();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
      this.toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    this.selectedFile = file;

    // Tạo preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = undefined;
    this.previewUrl = undefined;
    this.currentProduct.imageUrl = undefined;
  }

  async uploadImage(): Promise<string | undefined> {
    if (!this.selectedFile) return this.currentProduct.imageUrl;

    this.isUploading = true;
    try {
      return await this.productService.upload(this.selectedFile).toPromise();
    } catch (err) {
      this.toast.error('Upload ảnh thất bại');
      return undefined;
    } finally {
      this.isUploading = false;
    }
  }

  calculatorPrice(): void {
    this.currentProduct.price =
      (this.currentProduct?.originalPrice ?? 0) - (this.currentProduct?.discount ?? 0);

    if (this.currentProduct.price < 0) {
      this.toast.error('Giảm giá không được lớn hơn giá gốc');
      this.currentProduct.price = 0;
      this.currentProduct.discount = 0;
    }
  }
}
