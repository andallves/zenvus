import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateInputComponent } from './date-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

describe('DateInputComponent', () => {
  let component: DateInputComponent;
  let fixture: ComponentFixture<DateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, BsDatepickerModule, DateInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o label corretamente', () => {
    component.label = 'Data de Nascimento';
    fixture.detectChanges();
    const labelElement = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(labelElement.textContent).toContain('Data de Nascimento');
  });

  it('deve exibir o placeholder corretamente', () => {
    component.placeholder = 'Selecione uma data';
    fixture.detectChanges();
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElement.placeholder).toBe('Selecione uma data');
  });

  it('deve exibir a mensagem de erro quando hasError for verdadeiro', () => {
    component.hasError = true;
    component.errorMsg = 'Campo obrigatório';
    fixture.detectChanges();
    const errorMsgElement = fixture.debugElement.query(By.css('.invalid-feedback')).nativeElement;
    expect(errorMsgElement.textContent).toContain('Campo obrigatório');
  });

  it('deve chamar onValueChange ao alterar o valor do datepicker', () => {
    spyOn(component, 'onValueChange');
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.dispatchEvent(new Event('bsValueChange'));
    fixture.detectChanges();
    expect(component.onValueChange).toHaveBeenCalled();
  });

  it('deve limpar o campo de entrada ao clicar no botão de limpar', () => {
    component.value = new Date('01/01/2022');
    component.showX = true;
    fixture.detectChanges();
    const clearButton = fixture.debugElement.query(By.css('.clear-input'));
    clearButton.triggerEventHandler('click', new Event('click'));
    fixture.detectChanges();
    expect(component.value).toBe(new Date());
  });

  it('deve aplicar a classe is-invalid quando hasError for verdadeiro', () => {
    component.hasError = true;
    fixture.detectChanges();
    const inputWrapper = fixture.debugElement.query(By.css('.input-wrapper')).nativeElement;
    expect(inputWrapper.classList).toContain('is-invalid');
  });

  it('deve exibir o ícone de calendário', () => {
    const iconElement = fixture.debugElement.query(By.css('.bi-calendar2-check')).nativeElement;
    expect(iconElement).toBeTruthy();
  });

  it('deve exibir o asterisco obrigatório quando showMandatory for verdadeiro', () => {
    component.showMandatory = true;
    fixture.detectChanges();
    const mandatoryElement = fixture.debugElement.query(By.css('.mandatory')).nativeElement;
    expect(mandatoryElement).toBeTruthy();
  });
});
