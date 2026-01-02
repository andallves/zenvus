export const expenseLabels = (): Record<string, string> => {
  return {
    description: 'Descrição',
    categoryId: 'Categoria',
    date: 'Data',
    typeId: 'Tipo',
    amount: 'Valor',
    isInstallment: 'Parcelado',
    totalInstallments: 'Quantidade de parcelas',
    firstDueDate: 'Data da 1ª parcela',
  };
};

export const debtInstallmentLabels = (): Record<string, string> => {
  return {
    number: 'Parcela',
    amount: 'Valor',
    status: 'Status',
    dueDate: 'Data de Vencimento',
    paymentDate: 'Data de Pagamento',
  };
};

export const categoryLabels = (): Record<string, string> => {
  return {
    name: 'Nome',
    color: 'Cor',
    type: 'Tipo',
  };
};
