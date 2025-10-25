import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecondaryButtonComponent } from './secondary-button.component';
import { Component } from '@angular/core';

@Component({
  template: `
    <zen-secondary-button
      [btnText]="text"
      [type]="type"
      [disabled]="disabled"
      (buttonClicked)="onClick()"
    ></zen-secondary-button>
  `,
  standalone: true,
  imports: [SecondaryButtonComponent],
})
class TestHostComponent {
  text = 'Salvar';
  type: 'button' | 'submit' | 'reset' = 'button';
  disabled = false;
  isLoading = false;
  clickCount = 0;

  onClick() {
    this.clickCount++;
  }
}

describe(SecondaryButtonComponent.name, () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let buttonEl: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    buttonEl = fixture.nativeElement.querySelector('button');
  });

  it('should create the component', () => {
    expect(fixture).toBeTruthy();
  });

  it('should render the button text when not loading', () => {
    const text = buttonEl.textContent?.trim();
    expect(text).toBe('Salvar');
  });

  it('should disable the button when disabled is true', () => {
    host.disabled = true;
    fixture.detectChanges();
    expect(buttonEl.disabled).toBeTrue();
  });

  it('should enable the button when disabled is false', () => {
    host.disabled = false;
    fixture.detectChanges();
    expect(buttonEl.disabled).toBeFalse();
  });

  it('should emit event when clicked', () => {
    buttonEl.click();
    expect(host.clickCount).toBe(1);
  });

  it('should update button type correctly', () => {
    host.type = 'submit';
    fixture.detectChanges();
    expect(buttonEl.getAttribute('type')).toBe('submit');

    host.type = 'reset';
    fixture.detectChanges();
    expect(buttonEl.getAttribute('type')).toBe('reset');
  });
});
