import { TestBed } from '@angular/core/testing';

import { Xuxemon } from './xuxemon';

describe('Xuxemon', () => {
  let service: Xuxemon;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Xuxemon);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
