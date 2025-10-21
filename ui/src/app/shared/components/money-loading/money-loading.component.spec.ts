import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyLoadingComponent } from './money-loading.component';

describe('MoneyLoadingComponent', () => {
  let component: MoneyLoadingComponent;
  let fixture: ComponentFixture<MoneyLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoneyLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoneyLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
