import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../posts.model';
import { PostService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {

  isLoading = false;
  posts:Post[] = [];
  private postsSub!: Subscription;

  constructor(public postService: PostService) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(()=>{
      this.postService.getPosts();
      this.postsSub = this.postService.getPostUpdateListener().subscribe((posts: Post[]) => {
        this.posts = posts;
        this.isLoading = false;
      })
    }, 2000)
    }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }

  onDelete(postId: string) {
    this.postService.deletePost(postId);
  }
}