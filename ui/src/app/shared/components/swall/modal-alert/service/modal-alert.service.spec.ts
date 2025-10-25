import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  EventEmitter,
  Injector,
  NgZone
} from '@angular/core';
import { ModalAlertService, CREATE_COMPONENT } from './modal-alert.service';
import { ModalAlertComponent } from '../modal-alert.component';
import { ModalConfig, ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';

// Mock mais compatível do ModalAlertComponent
class MockModalAlertComponent implements Partial<ModalAlertComponent> {
  title = '';
  message = '';
  confirmButtonText = 'OK';
  cancelButtonText = 'Cancel';
  showCancelButton = false;
  icon = ModalIconType.Info;

  // Usar Subjects para simular os Observables
  confirm = new EventEmitter<void>();
  cancel = new EventEmitter<void>();

  // Spies para verificar chamadas
  confirmSubscribeSpy = jasmine.createSpy('confirm.subscribe');
  cancelSubscribeSpy = jasmine.createSpy('cancel.subscribe');

  constructor() {
    // Configurar os spies nos subjects
    this.confirm.subscribe = this.confirmSubscribeSpy;
    this.cancel.subscribe = this.cancelSubscribeSpy;
  }
}

xdescribe('ModalAlertService', () => {
  let service: ModalAlertService;
  let mockAppRef: jasmine.SpyObj<ApplicationRef>;
  let mockInjector: jasmine.SpyObj<Injector>;
  let mockEnvironmentInjector: jasmine.SpyObj<EnvironmentInjector>;
  let mockNgZone: NgZone;
  let mockCreateComponent: jasmine.Spy;
  let mockComponentRef: jasmine.SpyObj<ComponentRef<ModalAlertComponent>>;

  beforeEach(() => {
    // Criar mocks
    mockAppRef = jasmine.createSpyObj('ApplicationRef', ['attachView', 'detachView']);
    mockInjector = jasmine.createSpyObj('Injector', ['get']);
    mockEnvironmentInjector = jasmine.createSpyObj('EnvironmentInjector', ['get']);

    // Mock do ComponentRef
    mockComponentRef = jasmine.createSpyObj('ComponentRef', ['destroy'], {
      instance: new MockModalAlertComponent(),
      hostView: {
        rootNodes: [document.createElement('div')]
      }
    });

    // Mock da função createComponent
    mockCreateComponent = jasmine.createSpy('createComponent').and.returnValue(mockComponentRef);

    // Configurar TestBed
    TestBed.configureTestingModule({
      providers: [
        ModalAlertService,
        { provide: ApplicationRef, useValue: mockAppRef },
        { provide: Injector, useValue: mockInjector },
        { provide: EnvironmentInjector, useValue: mockEnvironmentInjector },

        { provide: CREATE_COMPONENT, useValue: mockCreateComponent }
      ]
    });

    service = TestBed.inject(ModalAlertService);
    mockNgZone  = TestBed.inject(NgZone);

    // Mock do document.body para testes
    document.body = document.createElement('body');
  });

  afterEach(() => {
    // Limpar após cada teste
    if (document.body) {
      document.body.innerHTML = '';
    }
  });

  describe('Criação do serviço', () => {
    it('deve ser criado', () => {
      expect(service).toBeTruthy();
    });

    it('deve injetar as dependências corretamente', () => {
      expect(service['appRef']).toBe(mockAppRef);
      expect(service['injector']).toBe(mockInjector);
      expect(service['environmentInjector']).toBe(mockEnvironmentInjector);
      expect(service['ngZone']).toBe(mockNgZone);
      expect(service['_createComponent']).toBe(mockCreateComponent);
    });
  });

  describe('open', () => {
    const mockConfig: ModalConfig = {
      title: 'Test Title',
      message: 'Test Message',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      icon: ModalIconType.Warning
    };

    beforeEach(() => {
      // Configurar o mock do runOutsideAngular para executar a função passada
      spyOn(mockNgZone, 'runOutsideAngular').and.callFake((fn: Function) => fn());
    });

    it('deve criar o componente modal com configurações corretas', fakeAsync(() => {
      // Act
      service.open(mockConfig);
      tick();

      // Assert
      expect(mockCreateComponent).toHaveBeenCalledWith(ModalAlertComponent, {
        environmentInjector: mockEnvironmentInjector,
        elementInjector: mockInjector
      });

      const instance = mockComponentRef.instance as unknown as MockModalAlertComponent;
      expect(instance.title).toBe(mockConfig.title);
      expect(instance.message).toBe(mockConfig.message);
      expect(instance.confirmButtonText).toBe(mockConfig.confirmButtonText);
      expect(instance.cancelButtonText).toBe(mockConfig.cancelButtonText);
      expect(instance.showCancelButton).toBe(mockConfig.showCancelButton);
      expect(instance.icon).toBe(mockConfig.icon);
    }));

    it('deve usar valores padrão quando não fornecidos', fakeAsync(() => {
      // Arrange
      const minimalConfig: Partial<ModalConfig> = {
        title: 'Minimal Title',
        message: 'Minimal Message',
      };

      // Act
      service.open(minimalConfig as ModalConfig);
      tick();

      // Assert
      const instance = mockComponentRef.instance as unknown as MockModalAlertComponent;
      expect(instance.confirmButtonText).toBe('OK');
      expect(instance.cancelButtonText).toBe('Cancel');
      expect(instance.showCancelButton).toBe(false);
      expect(instance.icon).toBe(ModalIconType.Info);
    }));

    it('deve configurar subscriptions para confirm e cancel', fakeAsync(() => {
      // Act
      service.open(mockConfig);
      tick();

      // Assert
      const instance = mockComponentRef.instance as unknown as MockModalAlertComponent;
      expect(instance.confirm.subscribe).toHaveBeenCalled();
      expect(instance.cancel.subscribe).toHaveBeenCalled();
    }));

    it('deve anexar o componente ao DOM', fakeAsync(() => {
      // Act
      service.open(mockConfig);
      tick();

      // Assert
      expect(mockAppRef.attachView).toHaveBeenCalledWith(mockComponentRef.hostView);
      expect(document.body.contains((mockComponentRef.hostView as any).rootNodes[0])).toBeTrue();
    }));

    it('deve lidar com ambiente sem document.body', fakeAsync(() => {
      // Arrange
      const originalBody = document.body;
      document.body = null as any;

      // Act
      service.open(mockConfig);
      tick();

      // Assert
      expect(mockAppRef.attachView).not.toHaveBeenCalled();

      // Restaurar
      document.body = originalBody;
    }));

    it('deve resolver a promise quando confirm é acionado', fakeAsync(async () => {
      // Arrange
      let confirmCallback: Function;
      ((mockComponentRef.instance as any).confirm.subscribe as jasmine.Spy).and.callFake((cb: Function) => {
        confirmCallback = cb;
      });

      // Act
      const openPromise = service.open(mockConfig);
      tick();

      // Simular clique no confirm
      confirmCallback!();
      tick();

      // Assert
      await expectAsync(openPromise).toBeResolved();
    }));

    it('deve resolver a promise quando cancel é acionado', fakeAsync(async () => {
      // Arrange
      let cancelCallback: Function;
      ((mockComponentRef.instance as any).cancel.subscribe as jasmine.Spy).and.callFake((cb: Function) => {
        cancelCallback = cb;
      });

      // Act
      const openPromise = service.open(mockConfig);
      tick();

      // Simular clique no cancel
      cancelCallback!();
      tick();

      // Assert
      await expectAsync(openPromise).toBeResolved();
    }));

    it('deve executar fora da zona do Angular', fakeAsync(() => {
      // Act
      service.open(mockConfig);
      tick();

      // Assert
      expect(mockNgZone.runOutsideAngular).toHaveBeenCalled();
    }));
  });

  describe('close', () => {
    beforeEach(() => {
      // Configurar um componentRef válido para testes de close
      const div = document.createElement('div');
      document.body.appendChild(div);

      (mockComponentRef.hostView as any).rootNodes[0] = div;

      (service as any).componentRef = mockComponentRef;
    });

    it('deve fechar o modal corretamente quando componentRef existe', () => {
      // Act
      service.close();

      // Assert
      expect(mockComponentRef.destroy).toHaveBeenCalled();
      expect(mockAppRef.detachView).toHaveBeenCalledWith(mockComponentRef.hostView);
    });

    it('deve remover o elemento do DOM quando existe', () => {
      // Arrange
      const domElem = (mockComponentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);

      // Act
      service.close();

      // Assert
      expect(document.body.contains(domElem)).toBeFalse();
    });

    it('não deve fazer nada quando componentRef não existe', () => {
      // Arrange
      (service as any).componentRef = undefined;

      // Act
      service.close();

      // Assert
      expect(mockComponentRef.destroy).not.toHaveBeenCalled();
      expect(mockAppRef.detachView).not.toHaveBeenCalled();
    });

    it('deve lidar com ambiente sem document.body no close', () => {
      // Arrange
      const originalBody = document.body;
      document.body = null as any;

      // Act
      service.close();

      // Assert
      expect(mockComponentRef.destroy).toHaveBeenCalled();
      expect(mockAppRef.detachView).not.toHaveBeenCalled();

      // Restaurar
      document.body = originalBody;
    });

    it('deve lidar com elemento DOM sem parentNode', () => {
      // Arrange
      const domElem = document.createElement('div');
      (mockComponentRef.hostView as any).rootNodes = [domElem];

      // Act
      service.close();

      // Assert
      expect(mockComponentRef.destroy).toHaveBeenCalled();
    });
  });

  describe('Integração entre open e close', () => {
    it('deve fechar o modal aberto anteriormente ao abrir um novo', fakeAsync(() => {
      // Arrange
      const firstConfig: Partial<ModalConfig> = {
        title: 'First Modal',
        message: 'First Message'
      };

      const secondConfig: Partial<ModalConfig> = {
        title: 'Second Modal',
        message: 'Second Message'
      };

      spyOn(service, 'close').and.callThrough();

      // Act - Abrir primeiro modal
      service.open(firstConfig as ModalConfig);
      tick();

      // Act - Abrir segundo modal (deve fechar o primeiro)
      service.open(secondConfig as ModalConfig);
      tick();

      // Assert
      expect(service.close).toHaveBeenCalled();
    }));
  });
});
