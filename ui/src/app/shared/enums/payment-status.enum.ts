export enum EPaymentStatus {
  PENDING = 1,
  ACTIVE = 2,
  CANCELLED = 3,
  PAID = 4,
  OVERDUE = 5,
}

export const StatusTypeLabel: Record<number, string> = {
  [EPaymentStatus.PENDING]: 'Pendente',
  [EPaymentStatus.ACTIVE]: 'Ativo',
  [EPaymentStatus.CANCELLED]: 'Cancelado',
  [EPaymentStatus.PAID]: 'Pago',
  [EPaymentStatus.OVERDUE]: 'Atrasado',
};
