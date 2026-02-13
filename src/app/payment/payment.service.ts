// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentResponse {
  status: string;
  message: string;
  url: string;
}

export interface TransactionStatus {
  status: string;
  message: string;
  orderId: string;
  transactionId: string;
  amount: string;
  bankCode: string;
  payDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api/payment';

  constructor(private http: HttpClient) { }

  createPayment(amount: number, orderId: number): Observable<PaymentResponse> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('orderId', orderId);

    return this.http.post<PaymentResponse>(`${this.apiUrl}/create-payment`, null, { params });
  }

  updateStatusPayment(orderId: string, status: number): Observable<void> {
    const params = new HttpParams()
      .set('orderId', orderId)
      .set('status', status);

    return this.http.post<void>(`http://localhost:8080/api/orders/update-status`, null, { params });
  }

  confirmOrder(orderId: string, confirm: number): Observable<void> {
    const params = new HttpParams()
      .set('orderId', orderId)
      .set('confirm', confirm);

    return this.http.post<void>(`http://localhost:8080/api/orders/confirm`, null, { params });
  }

  getTransactionStatus(queryParams: any): Observable<TransactionStatus> {
    return this.http.get<TransactionStatus>(`${this.apiUrl}/vnpay-return`, { params: queryParams });
  }
}
