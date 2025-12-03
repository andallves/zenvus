import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { By } from '@angular/platform-browser';
import { FotoPipe } from './foto.pipe';

describe('TableComponent', () => {
  let component: TableComponent<any>;
  let fixture: ComponentFixture<TableComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, TitleCasePipe, FotoPipe, TableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    component.columns = ['name', 'age', 'email'];
    component.columnLabels = { name: 'Nome', age: 'Idade', email: 'Email' };
    component.data = [
      { name: 'John Doe', age: 30, email: 'john@example.com' },
      { name: 'Jane Doe', age: 25, email: 'jane@example.com' },
      { name: 'Jim Beam', age: 35, email: 'jim@example.com' },
      { name: 'Jack Daniels', age: 40, email: 'jack@example.com' },
      { name: 'Johnny Walker', age: 45, email: 'johnny@example.com' },
    ];
    component.itemsPerPage = 2;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar as colunas corretamente', () => {
    const headerCells = fixture.debugElement.queryAll(By.css('th'));
    expect(headerCells.length).toBe(4); // 3 colunas + 1 coluna de ações
    expect(headerCells[0].nativeElement.textContent).toContain('Nome');
    expect(headerCells[1].nativeElement.textContent).toContain('Idade');
    expect(headerCells[2].nativeElement.textContent).toContain('Email');
    expect(headerCells[3].nativeElement.textContent).toContain('Ações');
  });

  // it('deve renderizar os dados paginados corretamente', () => {
  //   const rows = fixture.debugElement.queryAll(By.css('tr'));
  //   expect(rows.length).toBe(3); // 1 linha de cabeçalho + 2 linhas de dados
  //   const firstRowCells = rows[1].queryAll(By.css('td'));
  //   expect(firstRowCells[0].nativeElement.textContent).toContain('John Doe');
  //   expect(firstRowCells[1].nativeElement.textContent).toContain('30');
  //   expect(firstRowCells[2].nativeElement.textContent).toContain('john@example.com');
  // });

  it('deve chamar onEdit ao clicar no botão de editar', () => {
    spyOn(component, 'onEdit');
    const editButton = fixture.debugElement.query(By.css('.btn-warning'));
    editButton.triggerEventHandler('click', null);
    expect(component.onEdit).toHaveBeenCalledWith(component.data[0]);
  });

  it('deve chamar onDelete ao clicar no botão de excluir', () => {
    spyOn(component, 'onDelete');
    const deleteButton = fixture.debugElement.query(By.css('.btn-danger'));
    deleteButton.triggerEventHandler('click', null);
    expect(component.onDelete).toHaveBeenCalledWith(component.data[0]);
  });

});