import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddCategoryFormComponent } from '@modules/transactions/pages/category/components/add-category-form/add-category-form.component';
import { DeleteTemplateComponent } from '@modules/transactions/pages/category/components/delete-template/delete-template.component';
import { EditCategoryFormComponent } from '@modules/transactions/pages/category/components/edit-category-form/edit-category-form.component';
import { CategoryService } from '@modules/transactions/services/category.service';
import { FilterComponent } from '@shared/components/filter/filter.component';
import { HeaderTableComponent } from '@shared/components/header-table/header-table.component';
import { ColorPickerInputComponent } from '@shared/components/inputs/color-picker-input/color-picker-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { TableComponent } from '@shared/components/table/table.component';
import { ICategory } from '@shared/interfaces/category.interface';
import { LoadingService } from '@shared/layouts/default-layout/loading.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NgxColorsModule, validColorValidator } from 'ngx-colors';

export interface IFilter {
  name: string;
  color: string;
}

@Component({
  selector: 'zen-category',
  standalone: true,
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
  ],
})
export class CategoryComponent implements OnInit {
  dataCategory: ICategory = {} as ICategory;
  filterForm!: FormGroup;
  isLoadingFilter = false;
  isLoadingClearFilter = false;
  activeBadges: { label: string; key: string }[] = [];
  bsModalRef?: BsModalRef;
  page = 1;
  itensPorPagina = 10;
  totalItens = 0;
  filtros: IFilter = {} as IFilter;

  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(BsModalService);
  private readonly categoryService = inject(CategoryService);
  private readonly loadingService = inject(LoadingService);

  constructor() {
    this.initializeForm();
  }

  imgCursos = './header.svg';

  ngOnInit(): void {
    this.loaderCategories();
  }

  categoriesData: ICategory[] = [];
  categoryColumn: string[] = ['nome', 'cor'];

  @ViewChild('formAddTemplate', { static: true })
  formAddTemplate!: TemplateRef<HTMLElement>;
  @ViewChild('formEditTemplate', { static: true })
  formEditTemplate!: TemplateRef<HTMLElement>;
  @ViewChild('deleteTemplate', { static: true }) deleteTemplate!: TemplateRef<HTMLElement>;

  initializeForm() {
    this.filterForm = this.fb.group({
      name: ['', []],
      color: ['', [Validators.maxLength(7), Validators.minLength(4), validColorValidator()]],
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
    const payload = this.filterForm.value;
    this.loadingService.onActiveLoading();

    this.categoryService.getCategories(this.page, this.itensPorPagina, payload).subscribe({
      next: response => {
        this.totalItens = response.totalResults;
        this.categoriesData = response.result
          .filter((category: ICategory) => !category.disabled)
          .map((category: ICategory) => ({
            ...category,
          }));
        this.activeBadges = [];
        this.isLoadingFilter = false;
        this.isLoadingClearFilter = false;
      },
      error: error => {
        console.error('Erro ao carregar categorias:', error);
        this.isLoadingFilter = false;
        this.isLoadingClearFilter = false;
      },
      complete: () => {
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
    console.log('Mudança de página:', event);
    this.page = event;
    this.loaderCategories();
  }
}
