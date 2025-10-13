import { TestBed } from '@angular/core/testing';

import { Signup } from './signup.service';

describe('Signup', () => {
  let service: Signup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Signup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
