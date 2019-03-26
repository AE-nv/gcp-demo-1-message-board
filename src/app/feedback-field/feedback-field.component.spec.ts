import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackFieldComponent } from './feedback-field.component';

describe('FeedbackFieldComponent', () => {
  let component: FeedbackFieldComponent;
  let fixture: ComponentFixture<FeedbackFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedbackFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
