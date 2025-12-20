import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddCategoryFormComponent } from '@modules/transactions/pages/category/components/add-category-form/add-category-form.component';
import { ExpenseService } from '@modules/transactions/services/expense.service';
import { FilterComponent } from '@shared/components/filter/filter.component';
import { HeaderTableComponent } from '@shared/components/header-table/header-table.component';
import { ColorPickerInputComponent } from '@shared/components/inputs/color-picker-input/color-picker-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { ColumnLabel, TableComponent } from '@shared/components/table/table.component';
import { IBadge } from '@shared/domain-types/badges';
import { IOptions } from '@shared/domain-types/options';
import { EExpenseType, ExpenseTypeLabel } from '@shared/enums/expense-type.enum';
import { IExpense } from '@shared/interfaces/expense.interface';
import { LoadingService } from '@shared/layouts/default-layout/loading.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'zen-expense',
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.scss',
  imports: [
    AddCategoryFormComponent,
    ColorPickerInputComponent,
    FilterComponent,
    FormsModule,
    HeaderTableComponent,
    InputDefaultComponent,
    PageContainerComponent,
    ReactiveFormsModule,
    SelectInputComponent,
    TableComponent,
  ],
})
export class ExpenseComponent implements OnInit {
  dataExpense: IExpense = {} as IExpense;
  filterForm!: FormGroup;
  isLoadingFilter = false;
  isLoadingClearFilter = false;
  activeBadges: IBadge[] = [];
  bsModalRef?: BsModalRef;
  page = 1;
  itensPorPagina = 10;
  totalItens = 0;

  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(BsModalService);
  private readonly expenseService = inject(ExpenseService);
  private readonly loadingService = inject(LoadingService);
  private readonly modalAlertService = inject(ModalAlertService);

  constructor() {
    this.initializeForm();
  }

  imgCursos = './header.svg';

  ngOnInit(): void {
    this.loaderExpenses();
  }

  expensesData: IExpense[] = [];
  expenseColumn: string[] = ['description', 'categoryName', 'amount', 'date', 'type', 'hasDebt'];
  expenseColumnsLabel: ColumnLabel = {
    description: 'Descrição',
    type: 'Tipo de Despesa',
    categoryName: 'Categoria',
    amount: 'Valor',
    date: 'Data',
    hasDebt: 'Parcelado',
  };
  optionsInput: IOptions[] = [
    { label: 'Fixo', value: EExpenseType.Fixed },
    { label: 'Variáveis', value: EExpenseType.Variable },
    { label: 'Assinaturas', value: EExpenseType.Subscription },
    { label: 'Empréstimo', value: EExpenseType.Loan },
    { label: 'Outros', value: EExpenseType.Other },
  ];

  public tableEnumLabels = {
    type: ExpenseTypeLabel,
  };

  // @ViewChild('formAddTemplate', { static: true })
  // formAddTemplate!: TemplateRef<HTMLElement>;
  // @ViewChild('formEditTemplate', { static: true })
  // formEditTemplate!: TemplateRef<HTMLElement>;
  // @ViewChild('deleteTemplate', { static: true }) deleteTemplate!: TemplateRef<HTMLElement>;

  initializeForm() {
    this.filterForm = this.fb.group({
      category: ['', []],
      date: ['', []],
      description: ['', []],
      type: [EExpenseType, []],
      hasDebt: ['', []],
    });
  }

  changeData() {
    this.loaderExpenses();
  }

  onSearch() {
    this.loaderExpenses();
    this.isLoadingFilter = true;
  }

  loaderExpenses() {
    console.log('Carregando categorias para a página:', this.page);
    const payload = this.filterForm.value;
    this.loadingService.onActiveLoading();
    this.expenseService.getExpenses(this.page, this.itensPorPagina, payload).subscribe({
      next: response => {
        this.totalItens = response.totalResults;
        this.expensesData = response.result
          .filter((expense: IExpense) => !expense.disabled)
          .map((expense: IExpense) => ({
            ...expense,
            categoryName: expense.category.name,
            date: expense.date,
            type: expense.type,
          }));
        this.activeBadges = [];
      },
      error: error => {
        const erros = error.error.errors?.join('<br>') || error.message;
        this.modalAlertService
          .open({
            icon: ModalIconType.Error,
            title: 'Error',
            message: erros,
            confirmButtonText: 'Ok',
            showCancelButton: false,
            cancelButtonText: '',
          })
          .then(() => this.loadingService.onInactiveLoading());
      },
      complete: () => {
        this.isLoadingFilter = false;
        this.isLoadingClearFilter = false;
        this.loadingService.onInactiveLoading();
      },
    });
  }

  clearParam(param: string) {
    this.filterForm.get(param)?.setValue('');
    this.loaderExpenses();
  }

  onClearFilter() {
    this.page = 1;
    this.filterForm.reset();
    this.loaderExpenses();
  }

  openAddModal() {
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-plus',
        title: 'Adicionar Categoria',
        // formTemplate: this.formAddTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  openEditModal(event: IExpense) {
    this.dataExpense = event;
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-pencil-fill',
        title: 'Editar Categoria',
        // formTemplate: this.formEditTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  openDeleteModal(event: IExpense) {
    this.dataExpense = event;
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-trash-fill',
        title: 'Deletar Categoria',
        // formTemplate: this.deleteTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  onPageChange(event: number) {
    this.page = event;
    this.loaderExpenses();
  }
}
