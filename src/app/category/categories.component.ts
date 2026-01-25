import {Component, OnInit} from '@angular/core';
import {Category} from './category.model';
import {CategoriesService} from './categories.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';

declare var bootstrap: any;

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [NgForOf, FormsModule, NgIf, NgClass],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  categories: Category[] = [];
  searchKeyword = '';

  isEditMode = false;
  currentCategoryId?: number;
  categoryToDelete?: Category;

  currentCategory: Category = {
    name: '',
    description: ''
  };

  private categoryModal: any;
  private deleteModal: any;

  constructor(
    private categoryService: CategoriesService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: data => this.categories = data,
      error: err => this.toast.error(err.error || 'Không thể tải danh mục')
    });
  }

  search(): void {
    if (!this.searchKeyword.trim()) {
      this.loadCategories();
      return;
    }

    this.categoryService.search(this.searchKeyword).subscribe({
      next: data => this.categories = data,
      error: err => this.toast.error(err.error || 'Lỗi tìm kiếm')
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentCategory = { name: '', description: '' };
    this.openModal('categoryModal');
  }

  openEditModal(category: Category): void {
    this.isEditMode = true;
    this.currentCategoryId = category.id;
    this.currentCategory = { ...category };
    this.openModal('categoryModal');
  }

  save(): void {
    if (!this.currentCategory.name.trim()) {
      this.toast.error('Tên danh mục là bắt buộc');
      return;
    }

    if (this.isEditMode && this.currentCategoryId) {
      this.categoryService.update(this.currentCategoryId, this.currentCategory).subscribe({
        next: () => {
          this.toast.success('Cập nhật thành công');
          this.closeModal('categoryModal');
          this.loadCategories();
        },
        error: err => this.toast.error(err.error || 'Cập nhật thất bại')
      });
    } else {
      this.categoryService.create(this.currentCategory).subscribe({
        next: () => {
          this.toast.success('Thêm danh mục thành công');
          this.closeModal('categoryModal');
          this.loadCategories();
        },
        error: err => this.toast.error(err.error || 'Thêm thất bại')
      });
    }
  }

  openDeleteModal(category: Category): void {
    this.categoryToDelete = category;
    this.openModal('deleteModal');
  }

  confirmDelete(): void {
    if (!this.categoryToDelete?.id) return;

    this.categoryService.delete(this.categoryToDelete.id).subscribe({
      next: () => {
        this.toast.success('Xóa thành công');
        this.closeModal('deleteModal');
        this.loadCategories();
      },
      error: err => this.toast.error(err.error || 'Xóa thất bại')
    });
  }

  private openModal(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    const modal = new bootstrap.Modal(el);
    modal.show();
    id === 'categoryModal' ? this.categoryModal = modal : this.deleteModal = modal;
  }

  private closeModal(id: string): void {
    id === 'categoryModal'
      ? this.categoryModal?.hide()
      : this.deleteModal?.hide();
  }
}
