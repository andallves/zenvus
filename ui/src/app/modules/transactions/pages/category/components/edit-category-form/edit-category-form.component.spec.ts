import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { ValidationService } from '@shared/validators/input-validator.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { CursosService } from '../../services/cursos.service';
import { EditCategoryFormComponent } from './edit-category-form.component';

describe('EditCategoryFormComponent', () => {
  let component: EditCategoryFormComponent;
  let fixture: ComponentFixture<EditCategoryFormComponent>;
  let cursosService: jasmine.SpyObj<CursosService>;
  let modalService: jasmine.SpyObj<BsModalService>;
  let modalAlertService: jasmine.SpyObj<ModalAlertService>;
  let toastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    const cursosServiceSpy = jasmine.createSpyObj('CursosService', ['editCurso']);
    const modalServiceSpy = jasmine.createSpyObj('BsModalService', ['hide']);
    const modalAlertServiceSpy = jasmine.createSpyObj('ModalAlertService', ['open']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EditCategoryFormComponent],
      providers: [
        { provide: CursosService, useValue: cursosServiceSpy },
        { provide: BsModalService, useValue: modalServiceSpy },
        { provide: ModalAlertService, useValue: modalAlertServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        ValidationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCategoryFormComponent);
    component = fixture.componentInstance;
    cursosService = TestBed.inject(CursosService) as jasmine.SpyObj<CursosService>;
    modalService = TestBed.inject(BsModalService) as jasmine.SpyObj<BsModalService>;
    modalAlertService = TestBed.inject(ModalAlertService) as jasmine.SpyObj<ModalAlertService>;
    toastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.editCursoForm).toBeDefined();
    expect(component.editCursoForm.get('nome')).toBeDefined();
    expect(component.editCursoForm.get('tipo')).toBeDefined();
  });

  it('should call editCurso on form submit', () => {
    component.dataCurso = { id: 1, nome: 'Curso Teste' };
    component.editCursoForm.setValue({ nome: 'Curso Teste', tipo: '1' });
    cursosService.editCurso.and.returnValue(of({}));

    component.editCurso();

    expect(cursosService.editCurso).toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalledWith('Curso editado com sucesso!', 'Sucesso!');
  });

  it('should show error modal on service error', () => {
    component.dataCurso = { id: 1, nome: 'Curso Teste' };
    component.editCursoForm.setValue({ nome: 'Curso Teste', tipo: '1' });
    cursosService.editCurso.and.returnValue(
      throwError({ error: { erros: 'Erro ao editar curso' } })
    );

    component.editCurso();

    expect(modalAlertService.open).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Error',
      message: 'Erro ao editar curso',
      confirmButtonText: 'Ok',
    });
  });
});
