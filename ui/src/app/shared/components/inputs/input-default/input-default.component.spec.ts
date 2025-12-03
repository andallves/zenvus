import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputDefaultComponent } from './input-default.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

describe('InputDefaultComponent', () => {
  let component: InputDefaultComponent;
  let fixture: ComponentFixture<InputDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, InputDefaultComponent],
      providers: [provideNgxMask()],
    }).compileComponents();

    fixture = TestBed.createComponent(InputDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar onInputChange e chamar onChange com o valor do input', () => {
    spyOn(component, 'onChange');
    spyOn(component, 'onTouched');

    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.value = 'test value';
    inputElement.dispatchEvent(new Event('input'));

    expect(component.onChange).toHaveBeenCalledWith('test value');
    expect(component.onTouched).toHaveBeenCalled();
  });



  it('deve exibir a mensagem de erro quando hasError for verdadeiro', () => {
    component.hasError = true;
    component.errorMsg = 'Test error message';
    fixture.detectChanges();

    const errorElement: HTMLElement = fixture.debugElement.query(By.css('.invalid-feedback')).nativeElement;
    expect(errorElement.textContent).toContain('Test error message');
  });

  it('deve exibir o ícone de limpar quando showX for verdadeiro e houver um valor no input', () => {
    component.showX = true;
    component.value = 'test value';
    fixture.detectChanges();

    const clearButton = fixture.debugElement.query(By.css('.clear-input'));
    expect(clearButton).toBeTruthy();
  });

  it('não deve exibir o ícone de limpar quando showX for falso', () => {
    component.showX = false;
    component.value = 'test value';
    fixture.detectChanges();

    const clearButton = fixture.debugElement.query(By.css('.clear-input'));
    expect(clearButton).toBeFalsy();
  });

  it('deve chamar writeValue e atualizar o valor', () => {
    component.writeValue('new value');
    expect(component.value).toBe('new value');
  });

  it('deve registrar onChange', () => {
    const fn = () => {};
    component.registerOnChange(fn);
    expect(component.onChange).toBe(fn);
  });

  it('deve registrar onTouched', () => {
    const fn = () => {};
    component.registerOnTouched(fn);
    expect(component.onTouched).toBe(fn);
  });

  it('deve definir o estado desabilitado', () => {
    component.setDisabledState(true);
    expect(component.isDisable).toBeTrue();

    component.setDisabledState(false);
    expect(component.isDisable).toBeFalse();
  });

  it('deve chamar onInputChange e atualizar o valor', () => {
    spyOn(component, 'onChange');
    spyOn(component, 'onTouched');
    const event = { target: { value: 'input value' } };
    component.onInputChange(event);

    expect(component.value).toBe('input value');
    expect(component.onChange).toHaveBeenCalledWith('input value');
    expect(component.onTouched).toHaveBeenCalled();
  });
});