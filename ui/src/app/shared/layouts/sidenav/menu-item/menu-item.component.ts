import {NgClass} from '@angular/common';
import {Component, Input} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {SidenavMenuItems} from '../nav-data';

@Component({
  selector: 'zen-sidenav-menu-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
})
export class MenuItemComponent {
  @Input({ required: true }) isActiveBar!: boolean;
  @Input() label!: string;
  @Input() path!: string;
  @Input() classIcon!: string;
  @Input() menuItems!: SidenavMenuItems[] | null;
}
