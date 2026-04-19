/**
 * 인증 관련 API 함수
 *
 * 역할: 백엔드의 /api/auth/* 엔드포인트를 호출하는 함수들을 모아둔다.
 * 컴포넌트는 이 파일의 함수만 호출하면 되고, Axios의 존재를 몰라도 된다.
 *
 * Spring Boot 비유:
 *   - @Repository의 메서드에 해당. "구체 쿼리/요청"을 캡슐화한다.
 *   - 호출하는 쪽(@Service / 컴포넌트)은 "어떻게" 통신하는지가 아니라 "무엇을" 하는지에 집중.
 *
 * 타입 설계:
 *   - 요청/응답 타입을 파일 상단에 선언해 계약(contract)을 명시한다.
 *   - PRD 7.1 기준: POST /api/auth/login
 *     요청:  { email, password }
 *     응답:  { accessToken, refreshToken }  (PRD 9.1 JWT 기반 가정)
 */

import axios from 'axios';
import client from './client';

// ── 요청/응답 타입 ─────────────────────────────────────────────

export type LoginRequest = {
  email: string;
  password: string;
};

// TODO 1: LoginResponse 타입을 정의하세요.
//   PRD 9.1에 따르면 Access Token + Refresh Token이 반환됩니다.
//   필드 이름은 백엔드 응답과 정확히 일치해야 합니다.
//   백엔드 팀과 합의 전이면 일반적 관례를 따릅니다:
//     - accessToken: string
//     - refreshToken: string
//
//   힌트:
//     export type LoginResponse = {
//       accessToken: string;
//       refreshToken: string;
//     };

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
}

// ── API 함수 ───────────────────────────────────────────────────

// TODO 2: login 함수를 작성하세요.
//   시그니처:
//     export async function login(request: LoginRequest): Promise<LoginResponse> { ... }
//
//   구현 힌트:
//     const response = await client.post<LoginResponse>('/api/auth/login', request);
//     return response.data;
//
//   설명:
//     - client.post<LoginResponse>(...) 의 제네릭은 "응답 data가 이 타입이다"라고 알려줌
//       → Spring의 ParameterizedTypeReference<T>와 유사한 역할
//     - Axios는 응답을 { data, status, headers, ... } 객체로 감싸서 반환
//     - 우리는 data 부분만 관심 있으므로 response.data만 return
//     - async 함수는 Promise를 반환 — Spring의 CompletableFuture<T>와 개념 동일
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>('/api/auth/login', request);
  return response.data;
}

export type RefreshResponse = {
  accessToken: string;
};

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const response = await axios.post<RefreshResponse>(
    'http://localhost:8080/api/auth/refresh',
    { refreshToken },
  );
  return response.data;
}
