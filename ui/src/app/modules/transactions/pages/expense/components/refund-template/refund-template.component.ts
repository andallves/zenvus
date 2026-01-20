import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, input, Input, Output } from '@angular/core';
import { DebtInstallmentService } from '@modules/transactions/services/debt-installment.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { IDebtInstallment, IDebtInstallmentRefund } from '@shared/interfaces/debt.interface';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'zen-refund-template',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './refund-template.component.html',
  styleUrl: './refund-template.component.scss',
})
export class RefundTemplateComponent {
  dataInstallment = input.required<IDebtInstallment>();
  modalRef = input.required<BsModalRef>();
  @Input() isLoading = false;
  @Output() changeData = new EventEmitter<IDebtInstallment>();

  private readonly debtInstallmentService = inject(DebtInstallmentService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);

  onCloseModal() {
    this.modalRef().hide();
  }

  truncateText(item: string): string {
    const value = item;
    if (value.length > 30) {
      return value.slice(0, 30) + '...';
    }
    return value;
  }

  refundInstallmentAmount() {
    this.isLoading = true;

    const payload: IDebtInstallmentRefund = {
      debtId: this.dataInstallment().debtId,
      installmentId: this.dataInstallment().id,
    };

    this.debtInstallmentService
      .refundInstallmentAmount(payload, this.dataInstallment().debtId)
      .subscribe({
        next: response => {
          this.modalRef().hide();
          this.isLoading = false;
          this.changeData.emit(response);
          this.toastr.success('Parcela estornada com sucesso!', 'Sucesso!');
        },
        error: error => {
          console.log(error);
          const erros =
            error.error.errors?.join('<br>') || error.error.message || error.error.title;
          this.modalAlertService
            .open({
              icon: ModalIconType.Error,
              title: 'Ops!',
              message: erros,
              confirmButtonText: 'Ok',
              showCancelButton: false,
              cancelButtonText: '',
            })
            .finally(() => (this.isLoading = false));
        },
        complete: () => (this.isLoading = false),
      });
  }
}
