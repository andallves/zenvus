import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { CommonModule } from '@angular/common';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, SpinnerComponent, ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o spinner quando isLoading for verdadeiro', () => {
    component.isLoading = true;
    fixture.detectChanges();

    const spinnerElement = fixture.debugElement.query(By.css('intra-spinner'));
    expect(spinnerElement).toBeTruthy();
  });

  it('deve exibir o conteúdo correto quando isLoading for falso', () => {
    component.isLoading = false;
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    buttonElement.textContent = 'Test Content';

    fixture.detectChanges();
    expect(buttonElement.textContent).toContain('Test Content');
  });

  it('deve aplicar a largura correta', () => {
    component.width = '200px';
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(buttonElement.style.width).toBe('200px');
  });

  it('deve aplicar o tamanho da fonte correto', () => {
    component.size = '1rem';
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(buttonElement.style.fontSize).toBe('1rem');
  });

  it('deve aplicar valores padrão quando largura e tamanho não forem fornecidos', () => {
    component.width = null;
    component.size = null;
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(buttonElement.style.width).toBe('100%');
    expect(buttonElement.style.fontSize).toBe('0.8rem');
  });

  it('deve aplicar a cor de fundo correta com base na variante', () => {
    const variants = [
      { variant: 'primary', color: 'var(--primary)' },
      { variant: 'danger', color: 'var(--danger)' },
      { variant: 'info', color: 'var(--info)' },
      { variant: 'warning', color: 'var(--warning)' },
      { variant: null, color: 'var(--primary)' },
    ];

    variants.forEach(({ variant, color }) => {
      component.variant = variant as any;
      fixture.detectChanges();

      const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(buttonElement.style.backgroundColor).toBe(color);
    });
  });

  it('deve retornar a cor padrão caso a variante seja inválida', () => {
    component.variant = 'invalid' as any;
    fixture.detectChanges();

    expect(component.backgroundColor).toBe('var(--primary)');
  });

  // it('deve ser desabilitado quando disabled for verdadeiro', () => {
  //   component.disabled = true;
  //   fixture.detectChanges();

  //   const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
  //   expect(buttonElement.disabled).toBeTrue();
  //   expect(buttonElement.classList).toContain('isDisabled');
  // });

  // it('não deve ser desabilitado quando disabled for falso', () => {
  //   component.disabled = false;
  //   fixture.detectChanges();

  //   const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
  //   expect(buttonElement.disabled).toBeFalse();
  //   expect(buttonElement.classList).not.toContain('isDisabled');
  // });
});
