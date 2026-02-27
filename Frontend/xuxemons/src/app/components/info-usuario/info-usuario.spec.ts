import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoUsuario } from './info-usuario';

describe('InfoUsuario', () => {
  let component: InfoUsuario;
  let fixture: ComponentFixture<InfoUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
