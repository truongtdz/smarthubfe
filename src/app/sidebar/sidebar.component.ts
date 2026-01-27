import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit{

  ngOnInit(): void {}

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastrService
  ) {
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth'])
      .then(item => this.toast.success('Đăng xuất thành công!'));
  }
}
