import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextSelectInputComponent } from './text-select-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

describe('TextSelectInputComponent', () => {
  let component: TextSelectInputComponent;
  let fixture: ComponentFixture<TextSelectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TextSelectInputComponent,
        SpinnerComponent,
        NgxMaskDirective,
      ],
      providers: [provideNgxMask()],
    }).compileComponents();

    fixture = TestBed.createComponent(TextSelectInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o label corretamente', () => {
    component.label = 'Semestre';
    fixture.detectChanges();
    const labelElement = fixture.debugElement.query(
      By.css('label')
    ).nativeElement;
    expect(labelElement.textContent).toContain('Semestre');
  });

  it('deve exibir o placeholder corretamente no input', () => {
    component.placeholder = 'Digite o semestre';
    fixture.detectChanges();
    const inputElement = fixture.debugElement.query(
      By.css('input')
    ).nativeElement;
    expect(inputElement.placeholder).toBe('Digite o semestre');
  });

  it('deve exibir a mensagem de erro quando hasError for verdadeiro', () => {
    component.hasError = true;
    component.errorMsg = 'Campo obrigatório';
    fixture.detectChanges();
    const errorMsgElement = fixture.debugElement.query(
      By.css('.invalid-feedback')
    ).nativeElement;
    expect(errorMsgElement.textContent).toContain('Campo obrigatório');
  });

  it('deve limpar a seleção quando o botão de limpar for clicado', () => {
    component.value = 'teste';
    component.showX = true;
    fixture.detectChanges();

    const clearButton = fixture.debugElement.query(By.css('.clear-input'));
    clearButton.triggerEventHandler('click', new Event('click'));

    expect(component.value).toBe('');
  });

  it('deve chamar onChange e onTouched ao limpar a seleção', () => {
    spyOn(component, 'onChange');
    spyOn(component, 'onTouched');
    component.value = 'teste';
    component.showX = true;
    fixture.detectChanges();

    const clearButton = fixture.debugElement.query(By.css('.clear-input'));
    clearButton.triggerEventHandler('click', new Event('click'));

    expect(component.onChange).toHaveBeenCalledWith('');
    expect(component.onTouched).toHaveBeenCalled();
  });

  it('deve desabilitar o input quando isDisable for verdadeiro', () => {
    component.isDisable = true;
    fixture.detectChanges();
    const inputElement = fixture.debugElement.query(
      By.css('input')
    ).nativeElement;
    expect(inputElement.disabled).toBeTrue();
  });

  it('deve aplicar a classe is-invalid quando hasError for verdadeiro', () => {
    component.hasError = true;
    fixture.detectChanges();
    const inputWrapperElement = fixture.debugElement.query(
      By.css('.input-wrapper')
    ).nativeElement;
    expect(inputWrapperElement.classList).toContain('is-invalid');
  });

  it('deve alternar a visibilidade do dropdown', () => {
    component.isOpen = false;
    component.toggleDropdown();
    expect(component.isOpen).toBeTrue();

    component.toggleDropdown();
    expect(component.isOpen).toBeFalse();
  });

  it('deve selecionar uma opção e fechar o dropdown', () => {
    spyOn(component, 'onChange');
    spyOn(component, 'onTouched');

    const option = { value: 'opcao1', label: 'Opção 1' };
    component.selectOption(option);

    expect(component.value).toBe('opcao1');
    expect(component.isOpen).toBeFalse();
    expect(component.isFocused).toBeFalse();
    expect(component.onChange).toHaveBeenCalledWith('opcao1');
    expect(component.onTouched).toHaveBeenCalled();
  });

  it('deve aplicar a classe focused quando o dropdown estiver focado', () => {
    component.isFocused = true;
    fixture.detectChanges();
    const inputWrapperElement = fixture.debugElement.query(
      By.css('.input-wrapper')
    ).nativeElement;
    expect(inputWrapperElement.classList).toContain('focused');
  });

  it('deve remover emojis do input', () => {
    const inputElement = fixture.debugElement.query(
      By.css('input')
    ).nativeElement;
    const event = { target: { value: 'Teste 😀 emoji 🎉' } };

    component.onInputChange(event);

    expect(component.value).toBe('Teste  emoji ');
  });

  it('deve exibir opções no dropdown', () => {
    const options = [
      { value: 'opcao1', label: 'Opção 1' },
      { value: 'opcao2', label: 'Opção 2' },
    ];
    component.options = options;
    component.isOpen = true;
    fixture.detectChanges();

    const dropdownItems = fixture.debugElement.queryAll(
      By.css('.dropdown-item:not(.loading-item):not(.no-more-items)')
    );
    expect(dropdownItems.length).toBe(2);
    expect(dropdownItems[0].nativeElement.textContent.trim()).toBe('Opção 1');
    expect(dropdownItems[1].nativeElement.textContent.trim()).toBe('Opção 2');
  });

  it('deve retornar o label correto para a opção selecionada', () => {
    const options = [
      { value: 'opcao1', label: 'Opção 1' },
      { value: 'opcao2', label: 'Opção 2' },
    ];
    component.options = options;
    component.value = 'opcao1';

    const selectedLabel = component.getSelectedLabel();
    expect(selectedLabel).toBe('Opção 1');
  });

  it('deve retornar o placeholder quando nenhuma opção estiver selecionada', () => {
    component.options = [{ value: 'opcao1', label: 'Opção 1' }];
    component.value = '';
    component.placeholder = 'Selecione uma opção';

    const selectedLabel = component.getSelectedLabel();
    expect(selectedLabel).toBe('Selecione uma opção');
  });

  it('deve exibir o spinner quando estiver carregando mais itens', () => {
    component.isLoadingMore = true;
    component.isOpen = true;
    fixture.detectChanges();

    const loadingItem = fixture.debugElement.query(By.css('.loading-item'));
    expect(loadingItem).toBeTruthy();

    const spinner = fixture.debugElement.query(By.css('intra-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('não deve exibir o spinner quando não estiver carregando', () => {
    component.isLoadingMore = false;
    component.isOpen = true;
    fixture.detectChanges();

    const loadingItem = fixture.debugElement.query(By.css('.loading-item'));
    expect(loadingItem).toBeFalsy();
  });

  it('deve exibir mensagem quando todos os itens foram carregados', () => {
    component.hasMoreItems = false;
    component.options = Array(60)
      .fill(null)
      .map((_, i) => ({ value: i, label: `Opção ${i}` }));
    component.itemsPerPage = 50;
    component.isOpen = true;
    fixture.detectChanges();

    const noMoreItems = fixture.debugElement.query(By.css('.no-more-items'));
    expect(noMoreItems).toBeTruthy();
    expect(noMoreItems.nativeElement.textContent).toContain(
      'Todos os itens foram carregados'
    );
  });

  it('não deve exibir mensagem de fim quando há poucos itens', () => {
    component.hasMoreItems = false;
    component.options = Array(30)
      .fill(null)
      .map((_, i) => ({ value: i, label: `Opção ${i}` }));
    component.itemsPerPage = 50;
    component.isOpen = true;
    fixture.detectChanges();

    const noMoreItems = fixture.debugElement.query(By.css('.no-more-items'));
    expect(noMoreItems).toBeFalsy();
  });

  it('deve emitir loadMoreItems quando rolar perto do final', () => {
    spyOn(component.loadMoreItems, 'emit');
    component.hasMoreItems = true;
    component.isLoadingMore = false;

    const mockEvent = {
      target: {
        scrollTop: 150,
        scrollHeight: 200,
        clientHeight: 100,
      },
    };

    component.onDropdownScroll(mockEvent);

    expect(component.loadMoreItems.emit).toHaveBeenCalled();
  });

  it('não deve emitir loadMoreItems se já estiver carregando', () => {
    spyOn(component.loadMoreItems, 'emit');
    component.hasMoreItems = true;
    component.isLoadingMore = true;

    const mockEvent = {
      target: {
        scrollTop: 150,
        scrollHeight: 200,
        clientHeight: 100,
      },
    };

    component.onDropdownScroll(mockEvent);

    expect(component.loadMoreItems.emit).not.toHaveBeenCalled();
  });

  it('não deve emitir loadMoreItems se não há mais itens', () => {
    spyOn(component.loadMoreItems, 'emit');
    component.hasMoreItems = false;
    component.isLoadingMore = false;

    const mockEvent = {
      target: {
        scrollTop: 150,
        scrollHeight: 200,
        clientHeight: 100,
      },
    };

    component.onDropdownScroll(mockEvent);

    expect(component.loadMoreItems.emit).not.toHaveBeenCalled();
  });

  it('deve focar a próxima opção com seta para baixo', () => {
    component.options = [
      { value: 'opcao1', label: 'Opção 1' },
      { value: 'opcao2', label: 'Opção 2' },
    ];
    component.focusedOptionIndex = 0;

    component.focusNextOption();

    expect(component.focusedOptionIndex).toBe(1);
  });

  it('deve voltar para a primeira opção quando chegar ao final', () => {
    component.options = [
      { value: 'opcao1', label: 'Opção 1' },
      { value: 'opcao2', label: 'Opção 2' },
    ];
    component.focusedOptionIndex = 1;

    component.focusNextOption();

    expect(component.focusedOptionIndex).toBe(0);
  });

  it('deve focar a opção anterior com seta para cima', () => {
    component.options = [
      { value: 'opcao1', label: 'Opção 1' },
      { value: 'opcao2', label: 'Opção 2' },
    ];
    component.focusedOptionIndex = 1;

    component.focusPreviousOption();

    expect(component.focusedOptionIndex).toBe(0);
  });

  it('deve ir para a última opção quando estiver na primeira', () => {
    component.options = [
      { value: 'opcao1', label: 'Opção 1' },
      { value: 'opcao2', label: 'Opção 2' },
    ];
    component.focusedOptionIndex = 0;

    component.focusPreviousOption();

    expect(component.focusedOptionIndex).toBe(1);
  });

  it('deve processar teclas de navegação', () => {
    spyOn(component, 'toggleDropdown');
    spyOn(component, 'focusNextOption');
    spyOn(component, 'focusPreviousOption');

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(enterEvent, 'preventDefault');
    component.onKeydown(enterEvent);
    expect(enterEvent.preventDefault).toHaveBeenCalled();
    expect(component.toggleDropdown).toHaveBeenCalled();

    const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    spyOn(arrowDownEvent, 'preventDefault');
    component.onKeydown(arrowDownEvent);
    expect(arrowDownEvent.preventDefault).toHaveBeenCalled();
    expect(component.toggleDropdown).toHaveBeenCalled();

    component.isOpen = true;
    const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    spyOn(arrowUpEvent, 'preventDefault');
    component.onKeydown(arrowUpEvent);
    expect(arrowUpEvent.preventDefault).toHaveBeenCalled();
    expect(component.focusPreviousOption).toHaveBeenCalled();
  });

  it('deve implementar ControlValueAccessor corretamente', () => {
    const testValue = 'teste';

    component.writeValue(testValue);
    expect(component.value).toBe(testValue);

    const onChangeFn = jasmine.createSpy('onChange');
    component.registerOnChange(onChangeFn);
    component.onChange('novoValor');
    expect(onChangeFn).toHaveBeenCalledWith('novoValor');

    const onTouchedFn = jasmine.createSpy('onTouched');
    component.registerOnTouched(onTouchedFn);
    component.onTouched();
    expect(onTouchedFn).toHaveBeenCalled();

    component.setDisabledState(true);
    expect(component.isDisable).toBeTruthy();
  });

  it('deve fechar o dropdown quando clicar fora', () => {
    const insideElement = fixture.debugElement.query(
      By.css('input')
    ).nativeElement;
    spyOn((component as any).elementRef.nativeElement, 'contains').and.returnValue(true);

    const insideEvent = new MouseEvent('click', {
      target: insideElement,
    } as any);
    component.onFocus(insideEvent);

    expect(component.isFocused).toBeTruthy();

    spyOn((component as any).elementRef.nativeElement, 'contains').and.returnValue(
      false
    );

    const outsideEvent = new MouseEvent('click', {
      target: document.body,
    } as any);
    component.onFocus(outsideEvent);

    expect(component.isFocused).toBeFalsy();
    expect(component.isOpen).toBeFalsy();
  });

  it('deve aplicar a classe fixedSize quando a propriedade for true', () => {
    component.fixedSize = true;
    fixture.detectChanges();

    const boxInputElement = fixture.debugElement.query(
      By.css('.box-input')
    ).nativeElement;
    expect(boxInputElement.classList).toContain('fixedSize');
  });

  it('deve exibir asterisco obrigatório quando showMandatory for true', () => {
    component.showMandatory = true;
    fixture.detectChanges();

    const mandatoryElement = fixture.debugElement.query(By.css('.mandatory'));
    expect(mandatoryElement).toBeTruthy();
    expect(mandatoryElement.nativeElement.textContent).toBe('*');
  });

  it('deve aplicar máscara quando mask for definido', () => {
    component.mask = '000.000.000-00';
    fixture.detectChanges();

    const inputElement = fixture.debugElement.query(
      By.css('input')
    ).nativeElement;
    expect(inputElement.getAttribute('mask')).toBe('000.000.000-00');
  });
});
