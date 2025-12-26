export enum EPaymentStatus {
  Pending = 1,
  Active = 2,
  Cancelled = 3,
  Paid = 4,
}

export const StatusTypeLabel: Record<number, string> = {
  [EPaymentStatus.Pending]: 'Pendente',
  [EPaymentStatus.Active]: 'Ativo',
  [EPaymentStatus.Cancelled]: 'Cancelado',
  [EPaymentStatus.Paid]: 'Pago',
};
