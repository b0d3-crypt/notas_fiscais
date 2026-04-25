import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  data: T;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) { }

  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.base}${path}`, { params: params as any })
      .pipe(map((r) => r.data));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(map((r) => r.data));
  }

  postForm<T>(path: string, body: FormData): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(map((r) => r.data));
  }

  putForm<T>(path: string, body: FormData): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(map((r) => r.data));
  }

  delete(path: string): Observable<void> {
    return this.http.delete<void>(`${this.base}${path}`);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(map((r) => r.data));
  }

  download(path: string): Observable<Blob> {
    return this.http.get(`${this.base}${path}`, { responseType: 'blob' });
  }
}
