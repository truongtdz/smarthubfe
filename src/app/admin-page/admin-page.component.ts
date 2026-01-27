import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-admin-page',
  imports: [
    RouterOutlet,
    SidebarComponent,
    CommonModule
  ],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent {

}
