import { TestBed } from '@angular/core/testing';

import { FriendRequest } from './friend-request';

describe('FriendRequest', () => {
  let service: FriendRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendRequest);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
