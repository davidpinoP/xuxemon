import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mochila } from './mochila';

describe('Mochila', () => {
  let component: Mochila;
  let fixture: ComponentFixture<Mochila>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mochila]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mochila);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
