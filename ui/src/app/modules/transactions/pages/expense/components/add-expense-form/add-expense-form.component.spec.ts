import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { ValidationService } from '@shared/validators/input-validator.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { CursosService } from '../../services/cursos.service';
import { AddExpenseFormComponent } from './add-expense-form.component';

describe('UpdateExpenseFormComponent', () => {
  let component: AddExpenseFormComponent;
  let fixture: ComponentFixture<AddExpenseFormComponent>;
  let cursosService: jasmine.SpyObj<CursosService>;
  let modalAlertService: jasmine.SpyObj<ModalAlertService>;
  let toastr: jasmine.SpyObj<ToastrService>;
  let modalService: jasmine.SpyObj<BsModalService>;

  beforeEach(async () => {
    const cursosServiceSpy = jasmine.createSpyObj('CursosService', ['addCurso']);
    const modalAlertServiceSpy = jasmine.createSpyObj('ModalAlertService', ['open']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success']);
    const modalServiceSpy = jasmine.createSpyObj('BsModalService', ['hide']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, AddExpenseFormComponent],
      providers: [
        ValidationService,
        { provide: CursosService, useValue: cursosServiceSpy },
        { provide: ModalAlertService, useValue: modalAlertServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: BsModalService, useValue: modalServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddExpenseFormComponent);
    component = fixture.componentInstance;
    cursosService = TestBed.inject(CursosService) as jasmine.SpyObj<CursosService>;
    modalAlertService = TestBed.inject(ModalAlertService) as jasmine.SpyObj<ModalAlertService>;
    toastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    modalService = TestBed.inject(BsModalService) as jasmine.SpyObj<BsModalService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.addCursoForm).toBeDefined();
    expect(component.addCursoForm.get('nome')).toBeDefined();
    expect(component.addCursoForm.get('tipo')).toBeDefined();
  });

  it('should call addCurso on form submit', () => {
    component.addCursoForm.setValue({ nome: 'Test Curso', tipo: '1' });
    cursosService.addCurso.and.returnValue(of({}));

    component.addCurso();

    expect(cursosService.addCurso).toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalledWith('Curso cadastrado com sucesso!', 'Sucesso!');
  });

  // it('should show error modal if form is invalid', () => {
  //   component.addCursoForm.setValue({ nome: '', tipo: '' });

  //   component.addCurso();

  //   expect(modalAlertService.open).toHaveBeenCalledWith({
  //     icon: 'error',
  //     title: 'Error',
  //     message: 'Insira uma uma imagem',
  //     confirmButtonText: 'Ok'
  //   });
  // });

  it('should show error modal on service error', () => {
    component.addCursoForm.setValue({ nome: 'Test Curso', tipo: '1' });
    cursosService.addCurso.and.returnValue(throwError({ error: { erros: 'Erro ao criar curso' } }));

    component.addCurso();

    expect(modalAlertService.open).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Error',
      message: 'Erro ao criar curso',
      confirmButtonText: 'Ok',
    });
  });

  // it('should return max length and required error message', () => {
  //   const input = 'nome';
  //   const errorMessage = 'Error message';
  //   const validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;
  //   validationService.hasMaxLengthAndRequiredMsgError.and.returnValue(errorMessage);

  //   const result = component.getMaxLengthAndRequiredErrorMsg(input);

  //   expect(validationService.hasMaxLengthAndRequiredMsgError).toHaveBeenCalledWith(component.addCursoForm, input);
  //   expect(result).toBe(errorMessage);
  // });
});
