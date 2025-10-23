import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import {TemplatePageTitleStrategy} from '@core/strategies/template-page-title.strategy ';


describe(TemplatePageTitleStrategy.name, () => {
  let service: TemplatePageTitleStrategy;
  let titleService: jasmine.SpyObj<Title>;

  beforeEach(() => {
    const titleSpy = jasmine.createSpyObj('Title', ['setTitle']);

    TestBed.configureTestingModule({
      providers: [
        TemplatePageTitleStrategy,
        { provide: Title, useValue: titleSpy }
      ]
    });

    service = TestBed.inject(TemplatePageTitleStrategy);
    titleService = TestBed.inject(Title) as jasmine.SpyObj<Title>;
  });

  function createSnapshotWithTitle(pageTitle?: string): RouterStateSnapshot {
    const route = new ActivatedRouteSnapshot();
    if (pageTitle) {
      route.data = { title: pageTitle };
    }
    const snapshot = { root: route } as RouterStateSnapshot;
    return snapshot;
  }

  it('deve definir o título com sufixo "- Zenvus" quando houver título na rota', () => {
    const snapshot = createSnapshotWithTitle('Dashboard');
    spyOn(service, 'buildTitle').and.returnValue('Dashboard');

    service.updateTitle(snapshot);

    expect(titleService.setTitle).toHaveBeenCalledWith('Dashboard - Zenvus');
  });

  it('deve definir apenas "Zenvus" quando não houver título na rota', () => {
    const snapshot = createSnapshotWithTitle();
    spyOn(service, 'buildTitle').and.returnValue(undefined);

    service.updateTitle(snapshot);

    expect(titleService.setTitle).toHaveBeenCalledWith('Zenvus');
  });
});
