import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExpenseTemplateComponent } from './view-expense-template.component';

describe('ViewExpenseTemplateComponent', () => {
  let component: ViewExpenseTemplateComponent;
  let fixture: ComponentFixture<ViewExpenseTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewExpenseTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewExpenseTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
