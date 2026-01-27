import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import {HomeComponent} from './home/home.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {UsersComponent} from './users/users.component';
import {ProductsComponent} from './products/products.component';
import {OrdersComponent} from './orders/orders.component';
import {CategoriesComponent} from './category/categories.component';
import {InventoriesComponent} from './inventories/inventories.component';
import {AuthGuard} from './auth/auth.guard';
import {AdminPageComponent} from './admin-page/admin-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent},
  { path: 'home', component: HomeComponent},
  { path: 'orders', component: OrdersComponent},
  { path: 'admin',
    component: AdminPageComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'inventories', component: InventoriesComponent },
      { path: 'orders', component: OrdersComponent },
    ]
  },
];
