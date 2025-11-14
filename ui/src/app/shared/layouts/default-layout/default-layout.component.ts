import { Component } from '@angular/core';
import {RouterModule} from '@angular/router';
import {SidenavComponent} from '@shared/layouts/sidenav/sidenav.component';

@Component({
  selector: 'zen-default-layout',
  imports: [RouterModule, SidenavComponent],
  templateUrl: './default-layout.component.html',
  styleUrl: './default-layout.component.scss',
})
export class DefaultLayoutComponent {}
