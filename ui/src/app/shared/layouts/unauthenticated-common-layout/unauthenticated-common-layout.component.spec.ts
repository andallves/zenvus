import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthenticatedCommonLayoutComponent } from './unauthenticated-common-layout.component';

describe('UnauthenticatedCommonLayoutComponent', () => {
  let component: UnauthenticatedCommonLayoutComponent;
  let fixture: ComponentFixture<UnauthenticatedCommonLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthenticatedCommonLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthenticatedCommonLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
