import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import {HomeComponent} from './home/home.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {UsersComponent} from './users/users.component';
import {ProductsComponent} from './products/products.component';
import {OrdersComponent} from './orders/orders.component';
import {CategoriesComponent} from './category/categories.component';
import {InventoriesComponent} from './inventories/inventories.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin',
    component: DashboardComponent,
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'inventories', component: InventoriesComponent },
      { path: 'orders', component: OrdersComponent },
    ]
  },
];
