import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddExpenseFormComponent } from '@modules/transactions/pages/expense/components/add-expense-form/add-expense-form.component';
import { DeleteExpenseTemplateComponent } from '@modules/transactions/pages/expense/components/delete-expense-template/delete-expense-template.component';
import { UpdateExpenseFormComponent } from '@modules/transactions/pages/expense/components/update-expense-form/update-expense-form.component';
import { ViewExpenseTemplateComponent } from '@modules/transactions/pages/expense/components/view-expense-template/view-expense-template.component';
import { CategoryService } from '@modules/transactions/services/category.service';
import { ExpenseService } from '@modules/transactions/services/expense.service';
import { FilterComponent } from '@shared/components/filter/filter.component';
import { HeaderTableComponent } from '@shared/components/header-table/header-table.component';
import { DateInputComponent } from '@shared/components/inputs/date-input/date-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { ColumnLabel, TableComponent } from '@shared/components/table/table.component';
import { IBadge } from '@shared/domain-types/badges';
import { IOptions } from '@shared/domain-types/options';
import { ECategoryType } from '@shared/enums/category-type.enum';
import { EExpenseType, ExpenseTypeLabel } from '@shared/enums/expense-type.enum';
import { IExpense, IExpenseFilter, IExpenseOptions } from '@shared/interfaces/expense.interface';
import { LoadingService } from '@shared/layouts/default-layout/loading.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'zen-expense',
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.scss',
  imports: [
    FilterComponent,
    FormsModule,
    HeaderTableComponent,
    InputDefaultComponent,
    PageContainerComponent,
    ReactiveFormsModule,
    SelectInputComponent,
    TableComponent,
    DateInputComponent,
    AddExpenseFormComponent,
    UpdateExpenseFormComponent,
    DeleteExpenseTemplateComponent,
    ViewExpenseTemplateComponent,
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
  itemsPerPage = 10;
  totalItems = 0;
  enumLabels = { type: ExpenseTypeLabel };
  expensesData: IExpense[] = [];
  expenseColumn: string[] = ['description', 'categoryName', 'amount', 'date', 'type', 'hasDebt'];
  expenseColumnsLabel: ColumnLabel = {
    description: 'Descrição',
    type: 'Tipo',
    categoryName: 'Categoria',
    amount: 'Valor',
    date: 'Data',
    hasDebt: 'Parcelado',
  };
  typesOptions: IOptions[] = [
    { label: 'Fixo', value: EExpenseType.Fixed },
    { label: 'Variável', value: EExpenseType.Variable },
    { label: 'Assinatura', value: EExpenseType.Subscription },
    { label: 'Empréstimo', value: EExpenseType.Loan },
    { label: 'Outros', value: EExpenseType.Other },
  ];
  categoriesOptions: IOptions[] = [];
  isInstallmentsOptions: IOptions[] = [
    { label: 'Não', value: false },
    { label: 'Sim', value: true },
  ];
  formFieldOptions: IExpenseOptions = {} as IExpenseOptions;

  @ViewChild('formAddExpenseTemplate', { static: true })
  formAddTemplate!: TemplateRef<HTMLElement>;
  @ViewChild('formEditExpenseTemplate', { static: true })
  formEditTemplate!: TemplateRef<HTMLElement>;
  @ViewChild('deleteExpenseTemplate', { static: true }) deleteTemplate!: TemplateRef<HTMLElement>;
  @ViewChild('viewExpenseTemplate', { static: true }) viewTemplate!: TemplateRef<HTMLElement>;

  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(BsModalService);
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly loadingService = inject(LoadingService);
  private readonly modalAlertService = inject(ModalAlertService);

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loaderExpenses();
    this.loaderCategoriesOptions();
    this.formFieldOptions = {
      typesOptions: this.typesOptions,
      categoriesOptions: this.categoriesOptions,
      isInstallmentsOptions: this.isInstallmentsOptions,
    };
  }

  initializeForm() {
    this.filterForm = this.fb.group({
      categoryId: ['', []],
      date: ['', []],
      description: ['', []],
      typeId: ['', []],
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
    const filter: IExpenseFilter = {
      description: this.filterForm.get('description')?.value,
      typeId: this.filterForm.get('typeId')?.value,
      categoryId: this.filterForm.get('categoryId')?.value,
      date: this.filterForm.get('date')?.value,
      page: this.page,
      itemsPerPage: this.itemsPerPage,
      orderAsc: this.filterForm.get('orderAsc')?.value || true,
      orderBy: this.filterForm.get('orderBy')?.value || 'createdAt',
    };
    this.loadingService.onActiveLoading();
    this.expenseService.getExpenses(filter).subscribe({
      next: response => {
        this.totalItems = response.totalResults;
        this.expensesData = response.result
          .filter((expense: IExpense) => !expense.disabled)
          .map((expense: IExpense) => ({
            ...expense,
            categoryName: expense.category.name,
            date: expense.date,
            type: expense.type,
            color: expense.category.color,
          }));
        console.log(this.expensesData);
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

  loaderCategoriesOptions() {
    this.categoryService.getCategoriesForSelect(true, ECategoryType.Expense).subscribe({
      next: options => {
        this.categoriesOptions = options;
        this.formFieldOptions.categoriesOptions = options;
      },
      error: err => console.error('Erro ao carregar categorias para o filtro', err),
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
        title: 'Adicionar Despesa',
        formTemplate: this.formAddTemplate,
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
        title: 'Editar Despesa',
        formTemplate: this.formEditTemplate,
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
        title: 'Deletar Despesa',
        formTemplate: this.deleteTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  openViewModal(event: IExpense) {
    this.dataExpense = event;
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-chat-text',
        title: `Detalhes ${event.description}`,
        formTemplate: this.viewTemplate,
      },
      class: 'modal-dialog-centered modal-lg',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  onPageChange(event: number) {
    this.page = event;
    this.loaderExpenses();
  }

  onExpenseUpdated(updated: IExpense) {
    this.expensesData = this.expensesData.map(exp => (exp.id === updated.id ? updated : exp));
    this.dataExpense = updated;
  }
}
