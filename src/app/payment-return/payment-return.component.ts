// src/app/components/payment-return/payment-return.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {PaymentService, TransactionStatus} from '../payment/payment.service';
import {DecimalPipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-payment-return',
  templateUrl: './payment-return.component.html',
  imports: [
    NgIf,
    DecimalPipe
  ],
  styleUrls: ['./payment-return.component.scss']
})
export class PaymentReturnComponent implements OnInit {
  transactionStatus: TransactionStatus | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    // Lấy tất cả query params từ URL
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.checkTransactionStatus(params);
      } else {
        this.isLoading = false;
      }
    });
  }

  checkTransactionStatus(params: any): void {
    this.paymentService.getTransactionStatus(params)
      .subscribe({
        next: (status) => {
          this.transactionStatus = status;
          this.isLoading = false;

          // Có thể lưu kết quả vào database hoặc update order status ở đây
          if (status.status === 'SUCCESS') {
            // TODO: Cập nhật trạng thái đơn hàng
            console.log('Payment successful:', status);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error checking transaction:', error);
        }
      });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
