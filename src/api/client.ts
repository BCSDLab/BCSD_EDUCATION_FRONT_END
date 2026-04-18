/**
 * Axios 인스턴스
 *
 * 앱 전체에서 공유하는 단 하나의 HTTP 클라이언트.
 *
 * Spring Boot 비유:
 *   - Spring: @Configuration 클래스에서 RestTemplate/WebClient를 @Bean으로 노출
 *   - 여기:   module scope에서 client 객체를 생성하고 default export
 *   → 둘 다 "앱 전체가 같은 인스턴스를 공유" (싱글톤).
 *
 * 왜 axios를 직접 쓰지 않고 인스턴스를 만드나?
 *   - baseURL, timeout, 공통 헤더를 한 번만 설정 가능
 *   - 나중에 인터셉터(JWT 자동 부착, 에러 공통 처리)를 얹을 때 이 인스턴스에만 달면 됨
 *   - Spring에서 RestTemplate을 @Bean으로 등록해 공통 ClientHttpRequestInterceptor를 다는 것과 동일
 */

import axios from 'axios';

const client = axios.create({
  // 백엔드 Spring Boot 기본 포트(8080) 기준.
  // 향후 .env(VITE_API_BASE_URL)로 환경별 분리 예정. 지금은 하드코딩.
  baseURL: 'http://localhost:8080',

  // 10초 내 응답 없으면 실패 처리 → 무한 대기 방지.
  // Spring Boot의 RestTemplate#setConnectTimeout + setReadTimeout에 해당.
  timeout: 10000,

  // 요청 본문을 JSON으로 보낸다. Axios는 이 헤더가 있으면 객체를 자동으로 JSON 직렬화.
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
