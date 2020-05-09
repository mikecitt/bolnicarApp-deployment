import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders, HttpClient } from '@angular/common/http';
import {map} from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

const httpOptions = {
	headers: new HttpHeaders({'Content-Type': 'application/json'})
}

export interface RegistrationForm {
	emailAddress: string;
	password: string;
	firstName: string;
	lastName: string;
	address: string;
	city: string;
	country: string;
	contact: string;
	jmbg: string;
}


const COOKIE_NAME = 'token';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

	private access_token = null;

	constructor(
		private http:HttpClient,
		private cookieService: CookieService,
		private router: Router,
		) {
		this.access_token = cookieService.get(COOKIE_NAME)
	}

	register(registration: RegistrationForm) {
		return this.http.post<any>('http://localhost:8080/auth/register', registration)
	}

	login(user) {
		const loginHeaders = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
    // const body = `username=${user.username}&password=${user.password}`;
    const body = {
      'username' : user.email,
      'password' : user.password
    };

    return this.http.post('http://localhost:8080/auth/login', body)
      .pipe(map((res) => {
        console.log('Login success:' + res['accessToken']);
        this.access_token = res['accessToken'];
        this.cookieService.set(COOKIE_NAME, this.access_token, res['expiresIn'])
        this.router.navigate(['/']);
      }));
	}

	tokenIsPresent() {
    return this.access_token != undefined && this.access_token != null;
  }

  getToken() {
    return this.access_token;
  }

  whoAmI() {
  	return this.http.get<any>('http://localhost:8080/whoami')
  }
}
