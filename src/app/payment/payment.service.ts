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

  createPayment(amount: number, orderInfo: string): Observable<PaymentResponse> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('orderInfo', orderInfo);

    return this.http.post<PaymentResponse>(`${this.apiUrl}/create-payment`, null, { params });
  }

  getTransactionStatus(queryParams: any): Observable<TransactionStatus> {
    return this.http.get<TransactionStatus>(`${this.apiUrl}/vnpay-return`, { params: queryParams });
  }
}
