import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-friend-search',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './friend-search.html',
  styleUrl: './friend-search.css'
})
export class FriendSearchComponent {
  @Input({ required: true }) control!: FormControl<string>;
  @Input() statusMessage = '';
}
