import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteTemplateComponent } from './delete-template.component';
import { CursosService } from '../../services/cursos.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from '@shared/button/button.component';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { ToastrService } from 'ngx-toastr';

describe('DeleteTemplateComponent', () => {
  let component: DeleteTemplateComponent;
  let fixture: ComponentFixture<DeleteTemplateComponent>;
  let cursosServiceMock: any;
  let modalServiceMock: any;
  let modalAlertServiceMock: any;
  let toastrMock: any;

  beforeEach(async () => {
    cursosServiceMock = {
      deleteCurso: jasmine.createSpy('deleteCurso').and.returnValue(of({}))
    };

    modalServiceMock = {
      hide: jasmine.createSpy('hide')
    };

    modalAlertServiceMock = {
      open: jasmine.createSpy('open')
    };

    toastrMock = {
      success: jasmine.createSpy('success')
    };

    await TestBed.configureTestingModule({
      imports: [DeleteTemplateComponent, ButtonComponent],
      providers: [
        { provide: CursosService, useValue: cursosServiceMock },
        { provide: BsModalService, useValue: modalServiceMock },
        { provide: ModalAlertService, useValue: modalAlertServiceMock },
        { provide: ToastrService, useValue: toastrMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteTemplateComponent);
    component = fixture.componentInstance;
    component.dataCurso = { id: 1, nome: 'Curso Teste' };
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar cursoService.deleteCurso ao deletar um curso', () => {
    component.deleteCurso();
    expect(cursosServiceMock.deleteCurso).toHaveBeenCalledWith(1);
  });

  it('deve exibir mensagem de sucesso ao deletar um curso com sucesso', () => {
    component.deleteCurso();
    expect(toastrMock.success).toHaveBeenCalledWith('Curso deletado com sucesso!', 'Sucesso!');
  });

  it('deve exibir mensagem de erro ao falhar ao deletar um curso', () => {
    cursosServiceMock.deleteCurso.and.returnValue(throwError({ error: 'Erro ao deletar curso' }));
    component.deleteCurso();
    expect(modalAlertServiceMock.open).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Error',
      message: 'Erro ao deletar curso',
      confirmButtonText: 'Ok'
    });
  });
});