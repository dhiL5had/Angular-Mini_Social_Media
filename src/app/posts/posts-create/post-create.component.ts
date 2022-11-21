import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { PostService } from '../posts.service';
import { mimeType } from './mime-type.validator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create-component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  postTitle: string = '';
  postContent: string = '';
  post: any;
  isLoading = false;
  
  form!: FormGroup;
  imagePreview: any;

  private mode = 'create';
  private postId!: string;
  private authStatusSub!: Subscription;

  constructor(
    public postService: PostService, 
    public route: ActivatedRoute,
    private authService: AuthService
    ) {}

  ngOnInit(): void {
    this.authStatusSub =  this.authService.getAuthStatusListener().subscribe(
      authStatu => {
        this.isLoading = false;
      })
    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null, {
        validators: [Validators.required],
      }),
      'image': new FormControl(null, {
        validators: [Validators.required], 
        asyncValidators: [mimeType]
      })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId') || '';
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe(postData => {
          this.post = {
            id: postData._id, 
            title: postData.title, 
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator,
          };
          this.form.setValue({
            'title': this.post.title, 
            'content': this.post.content,
            'image': this.post.imagePath,
          });
          this.isLoading = false;
        })
      } else {
        this.mode = 'create';
        this.postId = '';
      }
    });
  }

  onImageSelect(event: Event) {
    const file:any = (event.target as HTMLInputElement)?.files;
    this.form.patchValue({ image: file[0] });
    this.form.get("image")?.updateValueAndValidity();
    // populate a presentable image
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    }
    reader.readAsDataURL(file[0]);
  }

  onSavePost() {
    if (this.form.invalid) return;
    
    const {title, content, image} = this.form.value;
    this.isLoading = true;
    if(this.mode == 'create') {
      this.postService.addPost(title, content, image);
    } else {
      this.postService.updatePost(
        this.postId, 
        title, 
        content,
        image
        );
    }
    this.form.reset();
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}
