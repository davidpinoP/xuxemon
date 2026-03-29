import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XuxemonCardComponent } from './xuxemon-card';

describe('XuxemonCard', () => {
  let component: XuxemonCardComponent;
  let fixture: ComponentFixture<XuxemonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XuxemonCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XuxemonCardComponent);
    component = fixture.componentInstance;
    component.xuxemon = {
      id: 1,
      nombre: 'Demo',
      tipo: 'agua',
      tamano: 'Pequeño'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
