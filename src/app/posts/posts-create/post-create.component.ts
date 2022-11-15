import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Post } from '../posts.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create-component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent {
  postTitle: string = '';
  postContent: string = '';

  @Output() postCreated = new EventEmitter<Post>();

  constructor() {}

  onAddPost(form: NgForm) {
    if (form.invalid) return;
    const {title, content} = form.value;
    const POST:Post = {
      title: title,
      content: content,
    }
    this.postCreated.emit(POST);
  }
}
