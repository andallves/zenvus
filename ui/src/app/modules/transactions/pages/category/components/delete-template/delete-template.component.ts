import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CategoryService } from '@modules/transactions/services/category.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'zen-delete-template',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './delete-template.component.html',
  styleUrl: './delete-template.component.scss',
})
export class DeleteTemplateComponent {
  @Input() dataCurso: any = {};
  @Input() isLoading = false;
  @Output() changeData = new EventEmitter<void>();

  private readonly categoryService = inject(CategoryService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);

  onCloseModal() {
    this.modalService.hide();
  }

  truncateText(item: string): string {
    const value = item;
    if (value.length > 30) {
      return value.slice(0, 30) + '...';
    }
    return value;
  }

  deleteCategory() {
    this.isLoading = true;

    this.categoryService.deleteCategory(this.dataCurso.id).subscribe({
      next: () => {
        this.modalService.hide();
        this.isLoading = false;
        this.changeData.emit();
        this.toastr.success('Curso deletado com sucesso!', 'Sucesso!');
      },
      error: errors => {
        const erros = errors.error;
        this.modalAlertService.open({
          icon: ModalIconType.Error,
          title: 'Error',
          message: erros,
          confirmButtonText: 'Ok',
          showCancelButton: false,
          cancelButtonText: '',
        });
        this.isLoading = false;
      },
    });
  }
}
