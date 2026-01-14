import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeleteIncomeTemplateComponent } from '@modules/transactions/pages/income/components/delete-income-template/delete-income-template.component';
import { RegisterIncomeFormComponent } from '@modules/transactions/pages/income/components/register-income-form/register-income-form.component';
import { UpdateIncomeFormComponent } from '@modules/transactions/pages/income/components/update-income-form/update-income-form.component';
import { CategoryService } from '@modules/transactions/services/category.service';
import { IncomeService } from '@modules/transactions/services/income.service';
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
import { EIncomeType, IncomeTypeLabel } from '@shared/enums/income-type.enum';
import { IIncome, IIncomeFilter, IIncomeOptions } from '@shared/interfaces/income.interface';
import { LoadingService } from '@shared/layouts/default-layout/loading.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'zen-income',
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss',
  imports: [
    DateInputComponent,
    FilterComponent,
    FormsModule,
    HeaderTableComponent,
    InputDefaultComponent,
    PageContainerComponent,
    ReactiveFormsModule,
    SelectInputComponent,
    TableComponent,
    RegisterIncomeFormComponent,
    UpdateIncomeFormComponent,
    DeleteIncomeTemplateComponent,
  ],
})
export class IncomeComponent implements OnInit {
  income: IIncome = {} as IIncome;
  filterForm!: FormGroup;
  isLoadingFilter = false;
  isLoadingClearFilter = false;
  activeBadges: IBadge[] = [];
  bsModalRef?: BsModalRef;
  page = 1;
  itemsPerPage = 10;
  totalItems = 0;
  enumLabels = { type: IncomeTypeLabel };
  incomesData: IIncome[] = [];
  incomesColumn: string[] = ['description', 'type', 'amount', 'date'];
  incomesColumnsLabel: ColumnLabel = {
    description: 'Descrição',
    type: 'Tipo',
    amount: 'Valor',
    date: 'Data',
  };
  typesOptions: IOptions[] = [
    { label: 'Salário', value: EIncomeType.Salary },
    { label: 'Bônus', value: EIncomeType.Bonus },
    { label: 'Presente', value: EIncomeType.Gift },
    { label: 'Outros', value: EIncomeType.Other },
  ];
  categoriesOptions: IOptions[] = [];
  formFieldOptions: IIncomeOptions = {} as IIncomeOptions;

  @ViewChild('formRegisterIncomeTemplate', { static: true })
  formRegisterIncomeTemplate!: TemplateRef<HTMLElement>;
  @ViewChild('formUpdateIncomeTemplate', { static: true })
  formUpdateIncomeTemplate!: TemplateRef<HTMLElement>;
  @ViewChild('deleteIncomeTemplate', { static: true })
  deleteIncomeTemplate!: TemplateRef<HTMLElement>;

  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(BsModalService);
  private readonly incomeService = inject(IncomeService);
  private readonly categoryService = inject(CategoryService);
  private readonly loadingService = inject(LoadingService);
  private readonly modalAlertService = inject(ModalAlertService);

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loaderIncomes();
    this.loaderCategoriesOptions();
    this.formFieldOptions = {
      typesOptions: this.typesOptions,
      categoriesOptions: this.categoriesOptions,
    };
  }

  initializeForm() {
    this.filterForm = this.fb.group({
      categoryId: ['', []],
      month: ['', []],
      year: ['', []],
      description: ['', []],
      type: ['', []],
    });
  }

  changeData() {
    this.loaderIncomes();
  }

  onSearch() {
    this.loaderIncomes();
    this.isLoadingFilter = true;
  }

  loaderIncomes() {
    this.loadingService.onActiveLoading();

    const filterFormValues = this.filterForm.value;
    const filter: IIncomeFilter = {
      description: filterFormValues.description,
      type: filterFormValues.type,
      categoryId: filterFormValues.categoryId,
      month: filterFormValues.month,
      year: filterFormValues.year,
      disabled: false,
      page: this.page,
      itemsPerPage: this.itemsPerPage,
      orderAsc: this.filterForm.get('orderAsc')?.value || true,
      orderBy: this.filterForm.get('orderBy')?.value || 'createdAt',
    };

    this.incomeService.getIncomes(filter).subscribe({
      next: response => {
        this.totalItems = response.totalResults;
        this.incomesData = response.result;
        this.activeBadges = [];
      },
      error: error => {
        const erros = error.error.errors?.join('<br>') || error.error.message || error.message;
        this.modalAlertService
          .open({
            icon: ModalIconType.Error,
            title: 'Ops!',
            message: erros,
            confirmButtonText: 'Ok',
            showCancelButton: false,
            cancelButtonText: '',
          })
          .finally(() => this.loadingService.onInactiveLoading());
      },
      complete: () => {
        this.isLoadingFilter = false;
        this.isLoadingClearFilter = false;
        this.loadingService.onInactiveLoading();
      },
    });
  }

  loaderCategoriesOptions() {
    this.categoryService.getCategoriesForSelect(true, ECategoryType.Income).subscribe({
      next: options => {
        this.categoriesOptions = options;
        this.formFieldOptions.categoriesOptions = options;
      },
      error: err => console.error('Erro ao carregar categorias para o filtro', err),
    });
  }

  clearParam(param: string) {
    this.filterForm.get(param)?.setValue('');
    this.loaderIncomes();
  }

  onClearFilter() {
    this.page = 1;
    this.filterForm.reset();
    this.loaderIncomes();
  }

  openAddModal() {
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-plus',
        title: 'Registrar Receita',
        formTemplate: this.formRegisterIncomeTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  openEditModal(event: IIncome) {
    this.income = event;
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-pencil-fill',
        title: 'Editar Receita',
        formTemplate: this.formUpdateIncomeTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  openDeleteModal(event: IIncome) {
    this.income = event;
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-trash-fill',
        title: 'Deletar Receita',
        formTemplate: this.deleteIncomeTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  onPageChange(event: number) {
    this.page = event;
    this.loaderIncomes();
  }
}
