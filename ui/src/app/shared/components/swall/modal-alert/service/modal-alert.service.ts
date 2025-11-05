import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Injectable, InjectionToken, Injector, NgZone, inject } from '@angular/core';
import {
  ModalConfig,
  ModalIconType,
} from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertComponent } from '../modal-alert.component';

export type CreateComponentFn = typeof createComponent;
export const CREATE_COMPONENT = new InjectionToken<CreateComponentFn>('CREATE_COMPONENT', {
  providedIn: 'root',
  factory: () => createComponent,
});

@Injectable({
  providedIn: 'root',
})
export class ModalAlertService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly ngZone = inject(NgZone);
  private readonly _createComponent = inject<CreateComponentFn>(CREATE_COMPONENT);

  private componentRef!: ComponentRef<ModalAlertComponent>;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  open(config: ModalConfig): Promise<void> {
    return new Promise(resolve => {
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
      instance.icon = config.icon || ModalIconType.Info;

      this.ngZone.runOutsideAngular(() => {
        if (instance.confirm) {
          instance.confirm.subscribe(() => {
            this.close();
            resolve();
          });
        }
        if (instance.cancelBtn) {
          instance.cancelBtn.subscribe(() => {
            this.close();
            resolve();
          });
        }
      });

      if (typeof document !== 'undefined' && document?.body) {
        this.appRef.attachView(this.componentRef.hostView);
        const domElem = (this.componentRef.hostView as any).rootNodes[0] as HTMLElement;
        document.body?.appendChild(domElem);
      }
    });
  }

  close() {
    if (!this.componentRef) return;

    const view = this.componentRef.hostView;
    const domElem = (view as any).rootNodes?.[0] as HTMLElement;

    // ✅ Remove do DOM de forma segura
    if (domElem?.parentNode) {
      domElem.remove();
    }

    // ✅ Só tenta detach se o body ainda existe
    if (typeof document !== 'undefined' && document?.body) {
      this.appRef.detachView(view);
    }

    this.componentRef.destroy();
  }
}
