import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Post } from '../posts.model';
import { PostService } from '../posts.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create-component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  postTitle: string = '';
  postContent: string = '';
  post: any;
  isLoading = false;
  private mode = 'create';
  private postId!: string;

  constructor(public postService: PostService, public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId') || '';
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe(postData => {
          this.post = {id: postData._id, title: postData.title, content: postData.content};
          this.isLoading = false;
        })
      } else {
        this.mode = 'create';
        this.postId = '';
      }
    });
  }

  onSavePost(form: NgForm) {
    if (form.invalid) return;
    
    const {title, content} = form.value;
    this.isLoading = true;
    if(this.mode == 'create') {
      this.postService.addPost(title, content);
    } else {
      this.postService.updatePost(this.postId, title, content);
    }
    form.resetForm();
  }
}
