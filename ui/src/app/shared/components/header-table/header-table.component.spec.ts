import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTableComponent } from './header-table.component';

describe('HeaderTableComponent', () => {
  let component: HeaderTableComponent;
  let fixture: ComponentFixture<HeaderTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
