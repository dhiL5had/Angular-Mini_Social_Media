import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PostService } from '../posts.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create-component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent {
  postTitle: string = '';
  postContent: string = '';

  constructor(public postService: PostService) {}

  onAddPost(form: NgForm) {
    if (form.invalid) return;
    const {title, content} = form.value;
    this.postService.addPost(title, content);
    form.resetForm();
  }
}
