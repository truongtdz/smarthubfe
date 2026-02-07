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

          if (status.status === 'SUCCESS') {
            this.paymentService.updateStatusPayment(status.orderId, 1).subscribe({
              next: (response) => {
                console.log('Cập nhật trạng thái thành công', response);
              },
              error: (err) => {
                console.error('Lỗi khi cập nhật trạng thái', err);
              }
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.paymentService.updateStatusPayment(error.orderId, 0).subscribe({
            next: (response) => {
              console.log('Cập nhật trạng thái thành công', response);
            },
            error: (err) => {
              console.error('Lỗi khi cập nhật trạng thái', err);
            }
          });
        }
      });
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}
