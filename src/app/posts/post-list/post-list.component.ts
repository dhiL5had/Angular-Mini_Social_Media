import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

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
  userIsAuthenticated = false;
  userId!: string | null;
  private postsSub!: Subscription;
  private authStatusSubs!: Subscription;

  constructor(public postService: PostService, private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoading = true;
      this.postService.getPosts(this.postsPerPage, this.currentPage);
      this.userId = this.authService.getUserId();
      this.postsSub = this.postService.getPostUpdateListener().subscribe((postData: { posts: Post[], postcount: number }) => {
        this.posts = postData.posts;
        this.totalPosts = postData.postcount;
        this.isLoading = false;
      });
      this.userIsAuthenticated = this.authService.getIsAuth();
      this.authStatusSubs = this.authService.getAuthStatusListener().subscribe((isAuthenticated:any) => {
        this.userIsAuthenticated = this.userIsAuthenticated;
        this.userId = this.authService.getUserId();
      })
  }

  onPageChange(pageData: PageEvent) {
    this.isLoading = true;
    this.postsPerPage = pageData.pageSize;
    this.currentPage = pageData.pageIndex + 1;
    this.postService.getPosts(this.postsPerPage, this.currentPage);

  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe((response) => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    }, () => {
      this.isLoading = false;
    })
  }
  
  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSubs.unsubscribe();
  }
}