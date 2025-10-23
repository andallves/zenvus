import {
  ApplicationRef,
  ComponentRef, EventEmitter,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common'; // Mantido para garantia de infraestrutura, se necessário
import { ModalAlertService, CREATE_COMPONENT, ModalConfig } from './modal-alert.service';
import { ModalAlertComponent } from '../modal-alert.component';

describe('ModalAlertService', () => {
  let service: ModalAlertService;
  let appRef: ApplicationRef;
  let mockComponentRef: ComponentRef<ModalAlertComponent>;
  let confirmEmitter: EventEmitter<void>;
  let cancelEmitter: EventEmitter<void>;

  beforeEach(() => {
    confirmEmitter = new EventEmitter<void>();
    cancelEmitter = new EventEmitter<void>();

    // 1. Instância Mock do Componente Modal
    // O mock precisa ter as propriedades que o service tenta configurar e os Emitters que ele usa.
    const mockInstance = {
      title: '',
      message: '',
      confirmButtonText: '',
      cancelButtonText: '',
      showCancelButton: false,
      icon: 'info',
      confirm: confirmEmitter, // Usado para emitir o evento de confirmação no teste
      cancel: cancelEmitter,   // Usado para emitir o evento de cancelamento no teste
    } as ModalAlertComponent;

    // 2. Referência Mock do Componente (ComponentRef)
    // Apenas as propriedades usadas pelo service (instance, hostView, destroy) são necessárias.
    mockComponentRef = {
      instance: mockInstance,
      hostView: {
        rootNodes: [document.createElement('div')], // Simula o elemento DOM do componente
      } as any,
      destroy: jasmine.createSpy('destroy'), // Spy para verificar a remoção do DOM
    } as unknown as ComponentRef<ModalAlertComponent>;

    TestBed.configureTestingModule({
      // O CommonModule é geralmente suficiente para fornecer a infraestrutura básica
      // sem as complexidades do BrowserModule.
      imports: [CommonModule, ModalAlertComponent],
      providers: [
        ModalAlertService,
        // Provedor de fábrica para simular a criação do componente dinâmico
        {
          provide: CREATE_COMPONENT,
          useValue: () => mockComponentRef,
        },
        // Mock do ApplicationRef para verificar a anexação/desanexação da view
        {
          provide: ApplicationRef,
          useValue: {
            attachView: jasmine.createSpy('attachView'),
            detachView: jasmine.createSpy('detachView'),
          },
        },
        // REMOVIDOS Injector e EnvironmentInjector para evitar conflitos de dependências internas
      ],
    });

    service = TestBed.inject(ModalAlertService);
    appRef = TestBed.inject(ApplicationRef);
  });

  // --- Testes ---

  it('should open modal and resolve on confirm', async () => {
    const config: ModalConfig = {
      title: 'Test',
      message: 'Confirm?',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      showCancelButton: true,
      icon: 'success',
    };

    const promise = service.open(config);

    // Simula a interação do usuário no modal
    confirmEmitter.emit();

    // Verifica se a Promise foi resolvida
    await expectAsync(promise).toBeResolved();
    // Verifica se o modal foi desanexado e destruído
    expect(appRef.detachView).toHaveBeenCalledWith(mockComponentRef.hostView);
    expect(mockComponentRef.destroy).toHaveBeenCalled();
  });

  it('should open modal and reject on cancel', async () => {
    const config = {
      title: 'Test',
      message: 'Cancel?',
    };

    const promise = service.open(config);

    // Simula a interação do usuário no modal
    cancelEmitter.emit();

    // Verifica se a Promise foi rejeitada
    await expectAsync(promise).toBeRejected();
    // Verifica se o modal foi desanexado e destruído
    expect(appRef.detachView).toHaveBeenCalledWith(mockComponentRef.hostView);
    expect(mockComponentRef.destroy).toHaveBeenCalled();
  });
});
