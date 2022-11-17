import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
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
  totalPosts = 0;
  postsPerPage = 1;
  pageSizeOptions = [1, 5, 10, 15, 20, 100];
  currentPage = 1;
  posts:Post[] = [];
  private postsSub!: Subscription;

  constructor(public postService: PostService) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(()=>{
      this.postService.getPosts(this.postsPerPage, this.currentPage);
      this.postsSub = this.postService.getPostUpdateListener().subscribe((postData: { posts: Post[], postcount: number }) => {
        this.posts = postData.posts;
        this.totalPosts = postData.postcount;
        this.isLoading = false;
      })
    }, 2000)
  }

  onPageChange(pageData: PageEvent) {
    this.isLoading = true;
    this.postsPerPage = pageData.pageSize;
    this.currentPage = pageData.pageIndex + 1;
    this.postService.getPosts(this.postsPerPage, this.currentPage);

  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe((response) => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    })
  }

}