import { IErrorMsg } from '../domain-types/error-msg';

export const msg: IErrorMsg = {
  required: 'O campo é obrigatório',
  email: 'Email inválido',
  passwordMinLength: 'A senha deve conter no mínimo 8 caracteres',
  inputMaxLength: 'O campo deve conter no máximo 256 caracteres',
  inputMinLength: 'O campo deve conter no mínimo 3 caracteres',
  urlMinLength: 'O campo deve conter no mínimo 8 caracteres',
  urlMaxLength: 'O campo deve conter no máximo 2048 caracteres',
  siglaMaxLength: 'O campo deve conter no máximo 5 caracteres',
  passwordDoNotMatch: 'As senhas não coincidem',
  cpf: 'CPF inválido',
  cnpj: 'CNPJ inválido',
  cep: 'CEP inválido',
  telefone: 'Telefone inválido',
  numeroCartao: 'Número do cartão inválido',
  startDateInvalid: 'A data de início deve ser anterior à data de fim.',
  endDateInvalid: 'A data de fim deve ser posterior à data de início.',
  invalidDate: 'Data inválida',
};
