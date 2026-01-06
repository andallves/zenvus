import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { IncomeService } from '@modules/transactions/services/income.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { IIncome } from '@shared/interfaces/income.interface';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'zen-delete-income-template',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './delete-income-template.component.html',
  styleUrl: './delete-income-template.component.scss',
})
export class DeleteIncomeTemplateComponent {
  income = input.required<IIncome>();
  changeData = output();
  isLoading = signal(false);

  private readonly incomeService = inject(IncomeService);
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

  deleteIncome() {
    this.isLoading.set(true);

    this.incomeService.delete(this.income().id).subscribe({
      next: () => {
        this.modalService.hide();
        this.changeData.emit();
        this.toastr.success('Despesa deletada com sucesso!', 'Sucesso!');
      },
      error: error => {
        console.log(error);
        const erros = error.error.errors?.join('<br>') || error.error.message || error.message;
        this.modalAlertService
          .open({
            icon: ModalIconType.Error,
            title: 'Error',
            message: erros,
            confirmButtonText: 'Ok',
            showCancelButton: false,
            cancelButtonText: '',
          })
          .finally(() => this.isLoading.set(false));
      },
      complete: () => this.isLoading.set(false),
    });
  }
}
