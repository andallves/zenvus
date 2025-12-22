import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddCategoryFormComponent } from '@modules/transactions/pages/category/components/add-category-form/add-category-form.component';
import { DeleteTemplateComponent } from '@modules/transactions/pages/category/components/delete-template/delete-template.component';
import { EditCategoryFormComponent } from '@modules/transactions/pages/category/components/edit-category-form/edit-category-form.component';
import CategoryService from '@modules/transactions/services/category.service';
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
import { CategoryTypeLabel, ECategoryType } from '@shared/enums/category-type.enum';
import { ICategory, ICategoryFilter } from '@shared/interfaces/category.interface';
import { LoadingService } from '@shared/layouts/default-layout/loading.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NgxColorsModule, validColorValidator } from 'ngx-colors';

@Component({
  selector: 'zen-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
  imports: [
    PageContainerComponent,
    HeaderTableComponent,
    FilterComponent,
    TableComponent,
    AddCategoryFormComponent,
    DeleteTemplateComponent,
    EditCategoryFormComponent,
    ReactiveFormsModule,
    NgxColorsModule,
    ColorPickerInputComponent,
    InputDefaultComponent,
    SelectInputComponent,
  ],
})
export class CategoryComponent implements OnInit {
  dataCategory: ICategory = {} as ICategory;
  filterForm!: FormGroup;
  isLoadingFilter = false;
  isLoadingClearFilter = false;
  activeBadges: IBadge[] = [];
  bsModalRef?: BsModalRef;
  page = 1;
  itemsPerPage = 10;
  totalItems = 0;
  filters: ICategoryFilter = {} as ICategoryFilter;

  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(BsModalService);
  private readonly categoryService = inject(CategoryService);
  private readonly loadingService = inject(LoadingService);
  private readonly modalAlertService = inject(ModalAlertService);

  constructor() {
    this.initializeForm();
  }

  imgCategory = './header.svg';

  ngOnInit(): void {
    this.loaderCategories();
  }

  categoriesData: ICategory[] = [];
  categoryColumn: string[] = ['name', 'type', 'color'];
  categoryColumnsLabel: ColumnLabel = { name: 'nome', color: 'cor', type: 'tipo' };
  optionsInput: IOptions[] = [
    { label: 'Entrada', value: ECategoryType.Income },
    { label: 'Saída', value: ECategoryType.Expense },
  ];

  public tableEnumLabels = {
    type: CategoryTypeLabel,
  };
  @ViewChild('formAddTemplate', { static: true })
  formAddTemplate!: TemplateRef<HTMLElement>;
  @ViewChild('formEditTemplate', { static: true })
  formEditTemplate!: TemplateRef<HTMLElement>;
  @ViewChild('deleteTemplate', { static: true }) deleteTemplate!: TemplateRef<HTMLElement>;

  initializeForm() {
    this.filterForm = this.fb.group({
      name: ['', []],
      color: ['', [Validators.maxLength(7), Validators.minLength(4), validColorValidator()]],
      type: ['', []],
    });
  }

  changeData() {
    this.loaderCategories();
  }

  onSearch() {
    this.loaderCategories();
    this.isLoadingFilter = true;
  }

  loaderCategories() {
    console.log('Carregando categorias para a página:', this.page);
    this.loadingService.onActiveLoading();
    this.filters = {
      ...this.filterForm.value,
      page: this.page,
      itemsPerPage: this.itemsPerPage,
    };
    this.categoryService.getCategories(this.filters).subscribe({
      next: response => {
        this.totalItems = response.totalResults;
        this.categoriesData = response.result
          .filter((category: ICategory) => !category.disabled)
          .map((category: ICategory) => ({
            ...category,
            type: category.type,
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
    this.loaderCategories();
  }

  onClearFilter() {
    this.page = 1;
    this.filterForm.reset();
    this.loaderCategories();
  }

  openAddModal() {
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-plus',
        title: 'Adicionar Categoria',
        formTemplate: this.formAddTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  openEditModal(event: ICategory) {
    this.dataCategory = event;
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-pencil-fill',
        title: 'Editar Categoria',
        formTemplate: this.formEditTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  openDeleteModal(event: ICategory) {
    this.dataCategory = event;
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-trash-fill',
        title: 'Deletar Categoria',
        formTemplate: this.deleteTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  onPageChange(event: number) {
    this.page = event;
    this.loaderCategories();
  }
}
