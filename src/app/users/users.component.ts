import {Component, OnInit} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {User} from './users.model';
import {UsersService} from './users.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {ToastrService} from 'ngx-toastr';

declare var bootstrap: any;

@Component({
  selector: 'app-users',
  imports: [
    NgIf,
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    NgForOf
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  searchKeyword = '';
  isEditMode = false;
  currentUserId?: number;
  userToDelete?: User;

  currentUser: User = {
    email: '',
    password: '',
    fullName: '',
    role: 'USER'
  };

  private userModal: any;
  private deleteModal: any;

  constructor(
    private userService: UsersService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        this.showToast('error', err.error || 'Không thể tải danh sách người dùng');
      }
    });
  }

  searchUsers(): void {
    if (!this.searchKeyword.trim()) {
      this.loadUsers();
      return;
    }

    this.userService.searchUsers(this.searchKeyword).subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        this.showToast('error', err.error || 'Lỗi tìm kiếm');
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentUserId = undefined;
    this.currentUser = {
      email: '',
      password: '',
      fullName: '',
      role: 'USER'
    };
    this.openModal('userModal');
  }

  openEditModal(user: User): void {
    this.isEditMode = true;
    this.currentUserId = user.id;
    this.currentUser = { ...user };
    this.openModal('userModal');
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.openModal('deleteModal');
  }

  saveUser(): void {
    if (!this.currentUser.email || !this.currentUser.password ||
      !this.currentUser.fullName || !this.currentUser.role) {
      this.showToast('error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (this.currentUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.currentUser.email)) {
      this.showToast('error', 'Email không hợp lệ');
      return;
    }

    if (this.currentUser.password.length < 6) {
      this.showToast('error', 'Mật khẩu tối thiểu 6 ký tự');
      return;
    }

    if (this.currentUser.fullName.length < 2) {
      this.showToast('error', 'Họ tên tối thiểu 2 ký tự');
      return;
    }

    if (this.isEditMode && this.currentUserId) {
      this.userService.updateUser(this.currentUserId, this.currentUser).subscribe({
        next: () => {
          this.showToast('success', 'Cập nhật người dùng thành công');
          this.closeModal('userModal');
          this.loadUsers();
        },
        error: (err) => {
          this.showToast('error', err.error || 'Cập nhật thất bại');
        }
      });
    } else {
      this.userService.createUser(this.currentUser).subscribe({
        next: () => {
          this.showToast('success', 'Thêm người dùng thành công');
          this.closeModal('userModal');
          this.loadUsers();
        },
        error: (err) => {
          this.showToast('error', err.error || 'Thêm người dùng thất bại');
        }
      });
    }
  }

  confirmDelete(): void {
    if (!this.userToDelete?.id) return;

    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.showToast('success', 'Xóa người dùng thành công');
        this.closeModal('deleteModal');
        this.loadUsers();
      },
      error: (err) => {
        this.showToast('error', err.error || 'Xóa người dùng thất bại');
      }
    });
  }

  private openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();

      if (modalId === 'userModal') {
        this.userModal = modal;
      } else if (modalId === 'deleteModal') {
        this.deleteModal = modal;
      }
    }
  }

  private closeModal(modalId: string): void {
    if (modalId === 'userModal' && this.userModal) {
      this.userModal.hide();
    } else if (modalId === 'deleteModal' && this.deleteModal) {
      this.deleteModal.hide();
    }
  }

  private showToast(type: 'success' | 'error', message: string): void {
    if (type === 'success') {
      this.toast.success(message);
    } else {
      this.toast.error(message);
    }
  }
}
