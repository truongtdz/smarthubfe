import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from "@angular/router";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { filter } from 'rxjs/operators';

Chart.register(...registerables);

interface Statistics {
  revenueStats: {
    totalRevenue: number;
    todayRevenue: number;
    monthRevenue: number;
    growth: number;
  };
  orderStats: {
    totalOrders: number;
  };
  topProducts: Array<{
    productId: number;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  statistics: Statistics | null = null;
  isLoading = true;
  showStats = true;
  isOnDashboardRoot = true;

  private lineChart?: Chart;
  private barChart?: Chart;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStatistics();

    // Theo dõi route changes để ẩn/hiện stats
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isOnDashboardRoot = event.url === '/admin' || event.url === '/admin/';

      // Nếu quay về dashboard root, hiển thị stats và refresh charts
      if (this.isOnDashboardRoot && this.statistics) {
        this.showStats = true;
        setTimeout(() => this.initChartsIfReady(), 100);
      }
    });
  }

  ngAfterViewInit(): void {
    // Đợi một tick để đảm bảo ViewChild đã được khởi tạo
    setTimeout(() => this.initChartsIfReady(), 0);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadStatistics(): void {
    this.isLoading = true;
    this.http.get<Statistics>('http://localhost:8080/api/orders/statistics').subscribe({
      next: (data) => {
        this.statistics = data;
        this.isLoading = false;

        // Khởi tạo charts sau khi có dữ liệu
        setTimeout(() => this.initChartsIfReady(), 100);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.isLoading = false;
      }
    });
  }

  private initChartsIfReady(): void {
    // Chỉ khởi tạo nếu:
    // 1. Đang ở dashboard root
    // 2. Stats đang hiển thị
    // 3. Có dữ liệu
    // 4. ViewChild đã sẵn sàng
    if (!this.isOnDashboardRoot || !this.showStats || !this.statistics) {
      return;
    }

    if (!this.lineChartRef || !this.barChartRef) {
      console.warn('Chart canvas elements not ready yet');
      return;
    }

    this.initCharts();
  }

  private initCharts(): void {
    if (!this.statistics) return;

    // Hủy charts cũ nếu có
    this.destroyCharts();

    try {
      // Line Chart - Doanh thu theo tháng
      this.lineChart = new Chart(this.lineChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: this.statistics.monthlyRevenue.map(m => m.month),
          datasets: [{
            label: 'Doanh thu',
            data: this.statistics.monthlyRevenue.map(m => m.revenue),
            fill: true,
            tension: 0.4,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return 'Doanh thu: ' + this.formatPrice(context.parsed.y);
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => this.formatPrice(Number(value))
              }
            }
          }
        }
      });

      // Bar Chart - Top sản phẩm
      this.barChart = new Chart(this.barChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: this.statistics.topProducts.map(p => p.productName),
          datasets: [{
            label: 'Số lượng bán',
            data: this.statistics.topProducts.map(p => p.totalSold),
            backgroundColor: '#10b981',
            borderColor: '#059669',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });

      console.log('Charts initialized successfully');
    } catch (error) {
      console.error('Error initializing charts:', error);
    }
  }

  private destroyCharts(): void {
    if (this.lineChart) {
      this.lineChart.destroy();
      this.lineChart = undefined;
    }
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = undefined;
    }
  }

  formatPrice(price: number | null): string {
    if (price === null || price === undefined) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  toggleStats(): void {
    this.showStats = !this.showStats;

    if (this.showStats) {
      // Khởi tạo lại charts khi hiển thị
      setTimeout(() => this.initChartsIfReady(), 100);
    } else {
      // Hủy charts khi ẩn
      this.destroyCharts();
    }
  }
}
