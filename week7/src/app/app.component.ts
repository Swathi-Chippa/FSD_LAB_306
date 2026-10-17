import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required]
  });

  constructor(private fb: FormBuilder) {}

  submit() {
    if (this.form.valid) {
      alert('Form submitted successfully!');
      console.log(this.form.value);
    } else {
      alert('Please fill all fields correctly.');
    }
  }
}