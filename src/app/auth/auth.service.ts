import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { environment } from 'src/environments/environment.prod';
import { AuthData } from "./auth-data.model";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated = false;
  private token!: string | null;
  private tokenTimer!: NodeJS.Timer;
  private authStatusListener = new Subject<boolean>();

  constructor(private htt: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.htt.post(environment.baseUrl + 'user/signup', authData)
    .subscribe(response => {
      console.log(response);
    })
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.htt.post<{token: string, expiresIn: number}>(environment.baseUrl + 'user/login', authData)
      .subscribe(response => {
        const { token, expiresIn } = response;
        this.token = token;
        if (token) {
          this.setAuthTimer(expiresIn);
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn * 1000);
          console.log(expirationDate);
          this.saveAuthData(token, expirationDate);
          this.router.navigate(['/']);
        }
      })
  }

  autoAuthUser() {
    const authInfo:any = this.getAuthData();
    console.log("Auth Info", authInfo);
    if (!authInfo) return;
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInfo.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 100);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
  }

  private setAuthTimer(duration: number) {
    console.log(duration);
    this.tokenTimer = setTimeout(() => {
      this.logout()
    }, duration * 1000)
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expiration:any = localStorage.getItem('expiration');
    if (!token || !expiration) {
      return; 
    }
    return {
      token: token,
      expirationDate: new Date(expiration)
    }
  }

}