import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, map } from 'rxjs';
import { Router } from '@angular/router';

import { Post } from "./posts.model";
import { environment } from 'src/environments/environment.prod';

@Injectable({providedIn: 'root'})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}
  getPosts() {
    this.http.get<{message: string, posts: any}>(environment.baseUrl + 'posts')
    .pipe(map(postData => {
      return postData.posts.map((post:any) => {
        return {
          title: post.title,
          content: post.content,
          id: post._id
        }
      })
    }))
    .subscribe((posts) => {
      this.posts = posts;
      this.postsUpdated.next([...this.posts]);
    })
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string}>(environment.baseUrl + 'posts/' + id);
  }

  addPost(title: string, content: string) {
    const post: Post = {id:'', title, content};
    this.http.post<{message: string, postId: string}>(environment.baseUrl + 'posts', post).subscribe((resData) => {
      console.log(resData.message);
      const id = resData.postId;
      post.id = id;
      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = {id, title, content};
    this.http.patch(environment.baseUrl + 'posts/'+ id, post)
    .subscribe(response => {
      const updatedPosts = [...this.posts];
      const oldPostIndex = updatedPosts.findIndex(p => p.id == post.id);
      updatedPosts[oldPostIndex] = post;
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);
    })
  }

  deletePost(postId: string) {
    this.http.delete(environment.baseUrl + 'posts/' + postId)
    .subscribe((res) => {
      const updatedPosts = this.posts.filter(post => post.id !== postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
    })
  }
}