import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  EventEmitter,
  Injector,
  NgZone,
} from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  ModalConfig,
  ModalIconType,
} from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertComponent } from '../modal-alert.component';
import { CREATE_COMPONENT, ModalAlertService } from './modal-alert.service';

// Tipo helper para o método runOutsideAngular do NgZone (evita TS2304)
interface RunOutside {
  runOutsideAngular: <T>(fn: (...args: unknown[]) => T) => T;
}

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
  // Serviço espera `cancelBtn` — criar alias
  cancelBtn = this.cancel;

  // Spies para verificar chamadas
  confirmSubscribeSpy = jasmine.createSpy('confirm.subscribe');
  cancelSubscribeSpy = jasmine.createSpy('cancel.subscribe');

  constructor() {
    // Configurar os spies nos subjects
    // Substituímos o método subscribe por um spy para que os testes possam interceptar
    (this.confirm as unknown as { subscribe: unknown }).subscribe = this.confirmSubscribeSpy;
    // ensure cancelBtn.subscribe is also the spy
    (this.cancelBtn as unknown as { subscribe: unknown }).subscribe = this.cancelSubscribeSpy;
  }
}

describe('ModalAlertService', () => {
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
        rootNodes: [document.createElement('div')],
      },
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

        { provide: CREATE_COMPONENT, useValue: mockCreateComponent },
      ],
    });

    service = TestBed.inject(ModalAlertService);
    mockNgZone = TestBed.inject(NgZone);

    // Mock do document.body para testes (atribuição direta para evitar variável redundante)
    (document as unknown as { body: HTMLElement }).body = document.createElement('body');
  });

  afterEach(() => {
    // Limpar após cada teste
    const doc = document as unknown as { body: HTMLElement | null };
    if (doc.body) {
      doc.body.innerHTML = '';
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
      icon: ModalIconType.Warning,
    };

    beforeEach(() => {
      // Configurar o mock do runOutsideAngular para executar a função passada
      // usar uma interface tipada para evitar `any` e compatibilizar a assinatura
      spyOn(mockNgZone as unknown as RunOutside, 'runOutsideAngular').and.callFake(
        <T>(fn: (...args: unknown[]) => T) => fn()
      );
    });

    it('deve criar o componente modal com configurações corretas', fakeAsync(() => {
      // Act
      service.open(mockConfig);
      tick();

      // Assert
      expect(mockCreateComponent).toHaveBeenCalledWith(ModalAlertComponent, {
        environmentInjector: mockEnvironmentInjector,
        elementInjector: mockInjector,
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
      // verificamos se o spy de subscribe foi chamado
      expect(instance.confirmSubscribeSpy).toHaveBeenCalled();
      expect(instance.cancelSubscribeSpy).toHaveBeenCalled();
    }));

    it('deve anexar o componente ao DOM', fakeAsync(() => {
      // Act
      service.open(mockConfig);
      tick();

      // Assert
      expect(mockAppRef.attachView).toHaveBeenCalledWith(mockComponentRef.hostView);

      const rootNodesHolder = mockComponentRef.hostView as unknown as { rootNodes: Node[] };
      expect(document.body.contains(rootNodesHolder.rootNodes[0])).toBeTrue();
    }));

    it('deve lidar com ambiente sem document.body', fakeAsync(() => {
      // Arrange
      const originalBody = (document as unknown as { body: HTMLElement }).body;
      const doc = document as unknown as { body: HTMLElement | null };
      doc.body = null;

      // Act
      service.open(mockConfig);
      tick();

      // Assert
      expect(mockAppRef.attachView).not.toHaveBeenCalled();

      // Restaurar
      (document as unknown as { body: HTMLElement }).body = originalBody!;
    }));

    it('deve resolver a promise quando confirm é acionado', fakeAsync(async () => {
      // Arrange
      let confirmCallback: (() => void) | undefined;
      const instance = mockComponentRef.instance as unknown as MockModalAlertComponent;

      // Interceptar o subscribe (spy) e capturar o callback
      (instance.confirmSubscribeSpy as jasmine.Spy).and.callFake((cb: () => void) => {
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
      let cancelCallback: (() => void) | undefined;
      const instance = mockComponentRef.instance as unknown as MockModalAlertComponent;

      // Interceptar o subscribe (spy) e capturar o callback
      (instance.cancelSubscribeSpy as jasmine.Spy).and.callFake((cb: () => void) => {
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

      // atribuir o root node para o hostView do mock
      const hostViewHolder = mockComponentRef.hostView as unknown as { rootNodes: Node[] };
      hostViewHolder.rootNodes[0] = div;

      // atribuir componentRef interno do serviço de forma tipada
      (
        service as unknown as { componentRef?: jasmine.SpyObj<ComponentRef<ModalAlertComponent>> }
      ).componentRef = mockComponentRef;
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
      const domElem = (mockComponentRef.hostView as unknown as { rootNodes: Node[] })
        .rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);

      // Act
      service.close();

      // Assert
      expect(document.body.contains(domElem)).toBeFalse();
    });

    it('não deve fazer nada quando componentRef não existe', () => {
      // Arrange
      (service as unknown as { componentRef?: undefined }).componentRef = undefined;

      // Act
      service.close();

      // Assert
      expect(mockComponentRef.destroy).not.toHaveBeenCalled();
      expect(mockAppRef.detachView).not.toHaveBeenCalled();
    });

    it('deve lidar com ambiente sem document.body no close', () => {
      // Arrange
      const originalBody = (document as unknown as { body: HTMLElement }).body;
      const doc = document as unknown as { body: HTMLElement | null };
      doc.body = null;

      // Act
      service.close();

      // Assert
      expect(mockComponentRef.destroy).toHaveBeenCalled();
      expect(mockAppRef.detachView).not.toHaveBeenCalled();

      // Restaurar
      (document as unknown as { body: HTMLElement }).body = originalBody!;
    });

    it('deve lidar com elemento DOM sem parentNode', () => {
      // Arrange
      const domElem = document.createElement('div');
      const hostViewHolder = mockComponentRef.hostView as unknown as { rootNodes: Node[] };
      hostViewHolder.rootNodes = [domElem];

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
        message: 'First Message',
      };

      const secondConfig: Partial<ModalConfig> = {
        title: 'Second Modal',
        message: 'Second Message',
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
