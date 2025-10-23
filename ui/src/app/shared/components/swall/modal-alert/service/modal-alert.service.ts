import {
  Injectable,
  ComponentRef,
  ApplicationRef,
  Injector,
  EnvironmentInjector,
  createComponent, InjectionToken, Inject
} from '@angular/core';
import { ModalAlertComponent } from '../modal-alert.component';

export interface ModalConfig {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  icon?: 'success' | 'error' | 'warning' | 'info';
}

export type CreateComponentFn = typeof createComponent;
export const CREATE_COMPONENT = new InjectionToken<CreateComponentFn>(
  'CREATE_COMPONENT',
  { providedIn: 'root', factory: () => createComponent },
);

@Injectable({
  providedIn: 'root'
})
export class ModalAlertService {
  private componentRef!: ComponentRef<ModalAlertComponent>;

  constructor(
    private readonly appRef: ApplicationRef,
    private readonly injector: Injector,
    private readonly environmentInjector: EnvironmentInjector,
    @Inject(CREATE_COMPONENT) private readonly _createComponent: CreateComponentFn,
  ) {}

  open(config: ModalConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.componentRef = this._createComponent(ModalAlertComponent, {
        environmentInjector: this.environmentInjector,
        elementInjector: this.injector,
      });

      const instance = this.componentRef.instance;
      instance.title = config.title;
      instance.message = config.message;
      instance.confirmButtonText = config.confirmButtonText || 'OK';
      instance.cancelButtonText = config.cancelButtonText || 'Cancel';
      instance.showCancelButton = config.showCancelButton || false;
      instance.icon = config.icon || 'info';

      instance.confirm.subscribe(() => {
        this.close();
        resolve();
      });

      instance.cancel.subscribe(() => {
        this.close();
        reject();
      });

      this.appRef.attachView(this.componentRef.hostView);
      const domElem = (this.componentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    });
  }

  close() {
    this.appRef.detachView(this.componentRef.hostView);
    this.componentRef.destroy();
  }
}
