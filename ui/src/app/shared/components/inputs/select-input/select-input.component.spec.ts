import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectInputComponent } from './select-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

describe('SelectInputComponent', () => {
  let component: SelectInputComponent;
  let fixture: ComponentFixture<SelectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o label corretamente', () => {
    component.label = 'Situação';
    fixture.detectChanges();
    const labelElement = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(labelElement.textContent).toContain('Situação');
  });

  it('deve exibir o placeholder corretamente', () => {
    component.placeholder = 'Selecione uma opção';
    component.value = '';
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('.dropdown-toggle')).nativeElement;
    expect(buttonElement.textContent.trim()).toBe('Selecione uma opção');
  });

  it('deve exibir a mensagem de erro quando hasError for verdadeiro', () => {
    component.hasError = true;
    component.errorMsg = 'Campo obrigatório';
    fixture.detectChanges();
    const errorMsgElement = fixture.debugElement.query(By.css('.invalid-feedback')).nativeElement;
    expect(errorMsgElement.textContent).toContain('Campo obrigatório');
  });

  it('deve limpar a seleção quando o botão de limpar for clicado', () => {
    component.value = '1';
    component.showX = true;
    fixture.detectChanges();

    const clearButton = fixture.debugElement.query(By.css('.clear-input'));
    clearButton.triggerEventHandler('click', new Event('click'));

    expect(component.value).toBe('');
  });

  it('deve chamar onChange e onTouched ao limpar a seleção', () => {
    spyOn(component, 'onChange');
    spyOn(component, 'onTouched');
    component.value = '1';
    component.showX = true;
    fixture.detectChanges();

    const clearButton = fixture.debugElement.query(By.css('.clear-input'));
    clearButton.triggerEventHandler('click', new Event('click'));

    expect(component.onChange).toHaveBeenCalledWith('');
    expect(component.onTouched).toHaveBeenCalled();
  });

  it('deve desabilitar o dropdown quando isDisable for verdadeiro', () => {
    component.isDisable = true;
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('.dropdown-toggle')).nativeElement;
    expect(buttonElement.disabled).toBeTrue();
  });

  it('deve aplicar a classe is-invalid quando hasError for verdadeiro', () => {
    component.hasError = true;
    fixture.detectChanges();
    const dropdownElement = fixture.debugElement.query(By.css('.dropdown')).nativeElement;
    expect(dropdownElement.classList).toContain('is-invalid');
  });

  it('deve alternar a visibilidade do dropdown', () => {
    component.isOpen = false;
    component.toggleDropdown();
    expect(component.isOpen).toBeTrue();

    component.toggleDropdown();
    expect(component.isOpen).toBeFalse();
  });

  it('deve selecionar uma opção e fechar o dropdown', () => {
    const option = { value: '1', label: 'Opção 1' };
    component.selectOption(option);
    expect(component.value).toBe('1');
    expect(component.isOpen).toBeFalse();
  });

  it('deve aplicar a classe is-focused quando o dropdown estiver focado', () => {
    component.isFocused = true;
    fixture.detectChanges();
    const dropdownElement = fixture.debugElement.query(By.css('.dropdown')).nativeElement;
    expect(dropdownElement.classList).toContain('is-focused');
  });
});