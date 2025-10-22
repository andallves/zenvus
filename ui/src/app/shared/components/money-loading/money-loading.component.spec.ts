import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MoneyLoadingComponent } from './money-loading.component';

describe(MoneyLoadingComponent.name, () => {
  let fixture: ComponentFixture<MoneyLoadingComponent>;
  let comp: MoneyLoadingComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyLoadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoneyLoadingComponent);
    comp = fixture.componentInstance;
  });

  afterEach(() => {
    // ensure intervals are cleared between tests
    try {
      comp.ngOnDestroy();
    } catch {}
    // restore spies if present
    if ((Math.random as any).and && (Math.random as any).and.callThrough) {
      (Math.random as any).and.callThrough();
    }
    if ((Date.now as any).and && (Date.now as any).and.callThrough) {
      (Date.now as any).and.callThrough();
    }
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(comp).toBeTruthy();
  });

  it('should start coin loop, trigger bag bump and remove coin as time passes', fakeAsync(() => {
    // make randomness deterministic
    spyOn(Math, 'random').and.returnValue(0);
    spyOn(Date, 'now').and.returnValue(1000);

    fixture.detectChanges(); // ngOnInit -> startCoinLoop schedules interval

    // no coins yet before first interval tick
    expect(comp.coins.length).toBe(0);

    // advance to first interval firing (1000ms)
    tick(1000);
    // now one or more coins should have been pushed
    expect(comp.coins.length).toBeGreaterThan(0);

    // bag bump scheduled at emission + (delay + duration - 100)
    // with our deterministic Math.random() returns, duration = 1400, delay = 0
    // so bag bump occurs at emission_time + 1300 relative to emission, but because
    // emission occured at t=1000, we must advance by 1300 more ms
    tick(1300);
    expect(comp.bagBump).toBeTrue();

    // bump should reset after 300ms
    tick(300);
    expect(comp.bagBump).toBeFalse();

    // coin removal was scheduled at emission + (delay + duration + 100) => emission + 1500
    // by now we've advanced enough time; coins should be removed
    expect(comp.coins.length).toBe(0);
  }));

  it('triggerBagBump should set bagBump true then false after 300ms', fakeAsync(() => {
    fixture.detectChanges();
    comp.triggerBagBump();
    expect(comp.bagBump).toBeTrue();
    tick(300);
    expect(comp.bagBump).toBeFalse();
  }));

  it('ngOnDestroy should clear the interval', () => {
    fixture.detectChanges();
    // the component assigned an interval id during ngOnInit
    const spy = spyOn(window, 'clearInterval');
    comp.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});

