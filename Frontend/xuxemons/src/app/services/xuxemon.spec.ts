import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Xuxemon } from './xuxemon';

describe('Xuxemon', () => {
  let service: Xuxemon;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(Xuxemon);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
