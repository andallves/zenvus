import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthenticatedCommonLayout } from './unauthenticated-common-layout';

describe('UnauthenticatedCommonLayout', () => {
  let component: UnauthenticatedCommonLayout;
  let fixture: ComponentFixture<UnauthenticatedCommonLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthenticatedCommonLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthenticatedCommonLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
