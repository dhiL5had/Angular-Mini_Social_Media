import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, map } from 'rxjs';
import { Router } from '@angular/router';

import { Post } from './posts.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postcount: number}>();

  constructor(private http: HttpClient, private router: Router) {}
  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`
    this.http.get<{ message: string; posts: any, postcount: number }>(environment.baseUrl + 'posts' + queryParams)
    .pipe(map((postData) => {
      return { 
        posts: postData.posts.map((post: any) => {
        return {
          id: post._id,
          title: post.title,
          content: post.content,
          imagePath: post.imagePath,
          };
        }),
        postcount: postData.postcount
        };
      })
    ).subscribe((transformedPostData) => {
      this.posts = transformedPostData.posts;
      this.postsUpdated.next({
        posts: [...this.posts], 
        postcount: transformedPostData.postcount
      });
    });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
    }>(environment.baseUrl + 'posts/' + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>(
        environment.baseUrl + 'posts',
        postData
      )
      .subscribe((resData) => {
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = { id, title, content, imagePath: image };
    }
    this.http
      .patch(environment.baseUrl + 'posts/' + id, postData)
      .subscribe((response) => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http.delete(environment.baseUrl + 'posts/' + postId)
  }
}
