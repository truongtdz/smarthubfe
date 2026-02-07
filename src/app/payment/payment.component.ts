// src/app/components/payment/payment.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {PaymentService} from './payment.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  imports: [
    FormsModule,
    NgIf
  ],
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  amount: number = 0;
  orderInfo: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Có thể nhận data từ router state hoặc service
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.amount = navigation.extras.state['amount'] || 0;
      this.orderInfo = navigation.extras.state['orderInfo'] || '';
    }
  }

  processPayment(): void {
    if (this.amount <= 0) {
      this.errorMessage = 'Vui lòng nhập số tiền hợp lệ';
      return;
    }

    if (!this.orderInfo.trim()) {
      this.errorMessage = 'Vui lòng nhập thông tin đơn hàng';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // this.paymentService.createPayment(this.amount, this.orderInfo)
    //   .subscribe({
    //     next: (response) => {
    //       this.isLoading = false;
    //       if (response.status === 'OK' && response.url) {
    //         // Redirect to VNPAY payment page
    //         window.location.href = response.url;
    //       } else {
    //         this.errorMessage = response.message || 'Có lỗi xảy ra';
    //       }
    //     },
    //     error: (error) => {
    //       this.isLoading = false;
    //       this.errorMessage = 'Không thể kết nối đến server. Vui lòng thử lại.';
    //       console.error('Payment error:', error);
    //     }
    //   });
  }
}
