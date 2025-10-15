import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalAlertComponent } from './modal-alert.component';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('ModalAlertComponent', () => {
  let component: ModalAlertComponent;
  let fixture: ComponentFixture<ModalAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ModalAlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct message', () => {
    component.message = 'Test Message';
    fixture.detectChanges();
    const messageElement = fixture.debugElement.query(By.css('.modal-body')).nativeElement;
    expect(messageElement.textContent).toContain('Test Message');
  });

  it('should display the correct confirm button text', () => {
    component.confirmButtonText = 'Confirm';
    fixture.detectChanges();
    const confirmButtonElement = fixture.debugElement.query(By.css('.confirm-button')).nativeElement;
    expect(confirmButtonElement.textContent).toContain('Confirm');
  });

  it('should display the correct cancel button text', () => {
    component.cancelButtonText = 'Cancel';
    component.showCancelButton = true;
    fixture.detectChanges();
    const cancelButtonElement = fixture.debugElement.query(By.css('.cancel-button')).nativeElement;
    expect(cancelButtonElement.textContent).toContain('Cancel');
  });

  it('should emit confirm event when confirm button is clicked', () => {
    spyOn(component.confirm, 'emit');
    const confirmButtonElement = fixture.debugElement.query(By.css('.confirm-button')).nativeElement;
    confirmButtonElement.click();
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('should emit cancel event when cancel button is clicked', () => {
    component.showCancelButton = true;
    fixture.detectChanges();
    spyOn(component.cancel, 'emit');
    const cancelButtonElement = fixture.debugElement.query(By.css('.cancel-button')).nativeElement;
    cancelButtonElement.click();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should not display cancel button if showCancelButton is false', () => {
    component.showCancelButton = false;
    fixture.detectChanges();
    const cancelButtonElement = fixture.debugElement.query(By.css('.cancel-button'));
    expect(cancelButtonElement).toBeNull();
  });

  it('should display cancel button if showCancelButton is true', () => {
    component.showCancelButton = true;
    fixture.detectChanges();
    const cancelButtonElement = fixture.debugElement.query(By.css('.cancel-button')).nativeElement;
    expect(cancelButtonElement).toBeTruthy();
  });
});
