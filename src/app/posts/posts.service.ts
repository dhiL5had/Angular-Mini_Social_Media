import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, map } from 'rxjs';
import { Router } from '@angular/router';

import { Post } from './posts.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}
  getPosts() {
    this.http
      .get<{ message: string; posts: any }>(environment.baseUrl + 'posts')
      .pipe(
        map((postData) => {
          return postData.posts.map((post: any) => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
            };
          });
        })
      )
      .subscribe((posts) => {
        this.posts = posts;
        this.postsUpdated.next([...this.posts]);
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
        const post: Post = {
          id: resData.post.id,
          title: resData.post.title,
          content: resData.post.content,
          imagePath: resData.post.imagePath,
        };
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
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
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex((p) => p.id == id);
        const post: Post = { id, title, content, imagePath: '' };
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    this.http
      .delete(environment.baseUrl + 'posts/' + postId)
      .subscribe((res) => {
        const updatedPosts = this.posts.filter((post) => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
}
