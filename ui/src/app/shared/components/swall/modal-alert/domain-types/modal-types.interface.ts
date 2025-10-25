export interface ModalConfig {
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  showCancelButton: boolean;
  icon: ModalIconType;
}

export enum ModalIconType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info'
}
