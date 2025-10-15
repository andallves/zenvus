import { Injectable, ComponentRef, ApplicationRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { ModalAlertComponent } from '../modal-alert.component';

interface ModalConfig {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  icon?: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ModalAlertService {
  private componentRef!: ComponentRef<ModalAlertComponent>;

  constructor(
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  open(config: ModalConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ModalAlertComponent);
      this.componentRef = componentFactory.create(this.injector);

      this.componentRef.instance.title = config.title;
      this.componentRef.instance.message = config.message;
      this.componentRef.instance.confirmButtonText = config.confirmButtonText || 'OK';
      this.componentRef.instance.cancelButtonText = config.cancelButtonText || 'Cancel';
      this.componentRef.instance.showCancelButton = config.showCancelButton || false;
      this.componentRef.instance.icon = config.icon || 'info';

      this.componentRef.instance.confirm.subscribe(() => {
        this.close();
        resolve();
      });

      this.componentRef.instance.cancel.subscribe(() => {
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
