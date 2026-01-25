import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import {NgIf} from '@angular/common';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

  isLogin = true;

  email = '';
  password = '';
  fullName = '';

  constructor(
    private authService: AuthService,
    private toast: ToastrService,
    private router: Router
  ) {}

  switchMode() {
    this.isLogin = !this.isLogin;
  }

  submit() {
    if (this.isLogin) {
      this.authService.login({
        email: this.email,
        password: this.password
      }).subscribe({
        next: res => {
          this.authService.saveUser(res);
          this.router.navigate(['/home'])
            .then(item => this.toast.success('Đăng nhập thành công!'));
        },
        error: err => this.toast.error(err.error || 'Đăng nhập thất bại!')
      });
    } else {
      this.authService.register({
        email: this.email,
        password: this.password,
        fullName: this.fullName
      }).subscribe({
        next: () => {
          this.isLogin = true;
        },
        error: err => this.toast.error(err.error || 'Đăng nhập thất bại!')
      });
    }
  }
}
