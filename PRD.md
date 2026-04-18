# BCSD 교육 홈페이지 PRD (Product Requirements Document)

> **작성일**: 2026-04-08
> **버전**: v1.0
> **프로젝트명**: BCSD Education Platform

---

## 1. 프로젝트 개요

### 1.1 배경
BCSD 동아리는 기존에 Google Drive(프레젠테이션, 문서, 스프레드시트)를 활용하여 교육 자료 관리, 보고서 제출, 출석 관리 등을 수행해왔다. 이를 동아리 전용 교육 플랫폼으로 통합하여 효율적인 교육 운영을 목표로 한다.

### 1.2 목표
- 기존 Google Drive 기반 워크플로우를 웹 플랫폼으로 이전
- 트랙별 교육 과정을 체계적으로 관리
- 보고서 제출 및 피드백 프로세스 개선
- 출석 및 커리큘럼 관리 자동화

### 1.3 기술 스택
| 구분 | 기술 |
|------|------|
| Backend | Spring Boot (Java) |
| Frontend | React (TypeScript) |
| Database | MySQL (필요 시 PostgreSQL로 전환 가능) |
| File Storage | AWS S3 |
| 이메일 | AWS SES (Simple Email Service) |
| 인증 | JWT (이메일 기반) |
| 인프라 | AWS |

### 1.4 사용자 규모
- 동시 사용자: 약 20명 내외
- 사용자 유형: 교육장, 레귤러, 비기너

---

## 2. 사용자 역할 및 권한

### 2.1 역할 정의

| 역할 | 설명 |
|------|------|
| **교육장** | 교육 총괄 관리자. 레귤러의 모든 권한을 포함하며, 시스템 관리 권한을 추가로 가짐 |
| **레귤러** | 강의 진행 및 비기너 과제 리뷰 담당. 비기너의 모든 권한을 포함 |
| **비기너** | 교육 수강생. 강의 수강, 보고서 제출, 출석 확인 |

### 2.2 권한 계층 (포함 관계)

```
교육장 ⊃ 레귤러 ⊃ 비기너
```

### 2.3 권한 매트릭스

| 기능 | 교육장 | 레귤러 | 비기너 |
|------|--------|--------|--------|
| 회원 초대/승인 | O | X | X |
| 기수/트랙 관리 | O | X | X |
| 커리큘럼 관리 (CRUD) | O | X | X |
| 강의 자료 업로드 | O | O | X |
| 강의 자료 조회 | O | O | O |
| 보고서 작성/제출 | O | O | O |
| 보고서 리뷰/피드백 | O | O | X |
| 출석 체크 (관리) | O | O | X |
| 출석 현황 조회 (본인) | O | O | O |
| 출석 현황 조회 (전체) | O | O | X |
| 비기너 비활성화 (탈퇴 처리) | O | X | X |

---

## 3. 기수 및 트랙 관리

### 3.1 기수 (Semester)

- 형식: `{연도}-{상반기|하반기}` (예: `26-상반기`, `26-하반기`)
- 기수별로 데이터를 분리하여 관리
- 교육장이 기수를 생성/관리

### 3.2 트랙 (Track)

- 종류: FE, BE, Android, iOS, PM, DA, Design (총 7개)
- 트랙별로 커리큘럼, 강의 자료, 출석이 독립적으로 운영
- 특정 기수에 특정 트랙이 모집되지 않을 수 있음 (예: 25-상반기에 FE 미모집)
- 기수-트랙 조합으로 교육 과정이 구성됨

### 3.3 기수-트랙 관계

```
기수 (26-상반기)
├── BE 트랙 (모집 O)
│   ├── 커리큘럼
│   ├── 강의 자료
│   ├── 보고서
│   └── 출석
├── FE 트랙 (모집 X → 비활성)
├── Android 트랙 (모집 O)
│   ├── 커리큘럼
│   ├── ...
```

---

## 4. 기능 상세

### 4.1 회원 관리

#### 4.1.1 회원가입 및 인증
- **가입 방식**: 초대/승인 기반
  - 교육장이 이메일로 초대 링크를 발송
  - 초대받은 사용자가 링크를 통해 가입 (비밀번호 설정)
- **이메일**: 한국기술교육대학교 이메일 (`@koreatech.ac.kr`) 사용
- **이메일 도메인 검증**: `@koreatech.ac.kr` 도메인만 허용

#### 4.1.2 로그인/로그아웃
- 이메일 + 비밀번호 기반 로그인
- JWT 토큰 발급 (Access Token + Refresh Token)
- 로그아웃 시 토큰 무효화

#### 4.1.3 비밀번호 찾기
- 등록된 이메일로 비밀번호 재설정 링크 발송
- 링크를 통해 새 비밀번호 설정

#### 4.1.4 회원 정보
- 이름, 이메일, 역할, 소속 트랙, 소속 기수
- 한 사용자가 여러 기수에 걸쳐 활동할 수 있음 (예: 25-상반기 비기너 → 26-상반기 레귤러)

#### 4.1.5 쓰리아웃 제도 및 비활성화
- **쓰리아웃 규칙**: 비기너의 출석 결석 + 과제 미제출 횟수를 합산하여 3회 이상이면 탈퇴 대상
  - 트랙마다 기준이 다를 수 있음 (기본값: 3회)
  - 공결은 결석 횟수에 포함되지 않음
- **위반 횟수 추적**: 시스템이 비기너별 위반 횟수(결석 + 미제출)를 자동 집계하여 표시
- **비활성화**: 교육장이 쓰리아웃 대상 비기너를 확인 후 수동으로 비활성화 처리
  - 비활성화된 비기너는 로그인은 가능하나 해당 기수-트랙의 활동이 제한됨
  - 비활성화 사유 기록

### 4.2 강의 자료

#### 4.2.1 자료 업로드
- **업로드 권한**: 교육장, 레귤러
- **지원 형식**: 파일 업로드 (PDF, PPT, PPTX, 이미지 등)
- **메타데이터**: 제목, 설명, 트랙, 기수, 주차, 업로드일, 작성자

#### 4.2.2 자료 조회
- 트랙별, 기수별, 주차별 필터링
- 자료 목록 조회 및 상세 조회
- 파일 다운로드 및 미리보기 (PDF, 이미지)

#### 4.2.3 자료 관리
- 수정/삭제는 작성자 본인 또는 교육장만 가능

### 4.3 보고서

#### 4.3.1 보고서 작성
- **작성 방식**: 마크다운 에디터를 통한 자유 양식 작성
- **기능 요구사항**:
  - 마크다운 문법 지원 (제목, 굵게, 기울임, 목록 등)
  - 코드 블록 삽입 (구문 강조)
  - 이미지 업로드 및 삽입 (S3 저장)
  - 링크 삽입
  - 실시간 미리보기
- **메타데이터**: 제목, 트랙, 기수, 주차, 작성자, 작성일, 제출 상태

#### 4.3.2 보고서 제출
- 임시 저장 및 최종 제출 구분
- **제출 기한** 설정 (교육장이 관리)
- 기한 내 제출 여부 표시 (정시 제출 / 지각 제출 / 미제출)
- 제출 후 수정 가능 여부는 교육장이 설정

#### 4.3.3 보고서 리뷰 및 피드백
- **리뷰 권한**: 교육장, 레귤러
- **인라인 피드백**: 보고서 본문의 특정 텍스트를 선택하여 코멘트 작성
  - 기존 Google 문서의 드래그 → 댓글 기능을 재현
- **전체 코멘트**: 보고서 전체에 대한 피드백 작성
- 코멘트에 대한 답글 가능
- 코멘트 해결(resolve) 기능

### 4.4 출석

#### 4.4.1 출석 체크
- **방식**: 교육 진행자(교육장/레귤러)가 비기너를 호명하여 출석 체크
- **UI**: 해당 기수-트랙의 비기너 목록을 표시하고, 각 비기너의 출석 상태를 선택
- **출석 상태**: 출석 / 결석 / 공결

#### 4.4.2 출석 현황 조회
- **비기너**: 본인의 출석 현황만 조회 가능
- **교육장/레귤러**: 해당 트랙 전체 비기너의 출석 현황 조회
- 주차별 출석 현황 요약
- 출석률 통계

#### 4.4.3 공결 처리
- 비기너가 공결 사유를 제출
- 교육장 또는 레귤러가 공결 승인/거절

### 4.5 커리큘럼

#### 4.5.1 커리큘럼 관리
- **관리 권한**: 교육장
- 트랙별, 기수별 커리큘럼 생성
- 주차별 주제 및 내용 입력

#### 4.5.2 커리큘럼 조회
- 트랙별 커리큘럼 목록 조회
- 주차별 상세 내용 확인
- 현재 진행 중인 주차 표시

#### 4.5.3 커리큘럼 구조

```
커리큘럼 (BE 트랙, 26-상반기)
├── 1주차: Java 기초
│   ├── 주제: Java 문법 및 OOP
│   └── 내용: 변수, 조건문, 반복문, 클래스, 객체
├── 2주차: Spring Boot 입문
│   ├── 주제: Spring Boot 프로젝트 구성
│   └── 내용: 프로젝트 생성, MVC 패턴, REST API
├── ...
```

---

## 5. 화면 구성

### 5.1 공통
- **로그인 페이지**: 이메일/비밀번호 입력
- **비밀번호 찾기 페이지**: 이메일 입력 → 재설정 링크 발송
- **GNB(상단 네비게이션)**: 홈, 강의자료, 보고서, 출석, 커리큘럼, 마이페이지

### 5.2 대시보드 (홈)
- 현재 기수/트랙 정보
- 이번 주 커리큘럼 요약
- 미제출 보고서 알림
- 최근 강의 자료

### 5.3 강의 자료 페이지
- 자료 목록 (트랙/기수/주차 필터)
- 자료 상세 (미리보기 + 다운로드)
- 자료 업로드 폼 (교육장/레귤러)

### 5.4 보고서 페이지
- 보고서 목록 (제출 현황 포함)
- 보고서 작성/편집 (리치 텍스트 에디터)
- 보고서 상세 + 인라인 피드백
- 보고서 제출 현황 관리 (교육장/레귤러)

### 5.5 출석 페이지
- 출석 체크 UI (교육장/레귤러)
- 본인 출석 현황 (비기너)
- 전체 출석 현황 (교육장/레귤러)

### 5.6 커리큘럼 페이지
- 트랙별 커리큘럼 목록
- 주차별 상세 내용

### 5.7 관리 페이지 (교육장 전용)
- 회원 초대/관리
- 기수/트랙 관리
- 보고서 기한 설정

---

## 6. 데이터 모델 (핵심 엔티티)

### 6.1 ERD 개요

```
User ──┬── UserSemesterTrack ──┬── Semester
       │                       └── Track
       │
       ├── Lecture (강의 자료)
       │
       ├── Report (보고서) ── ReportComment (인라인/전체 피드백)
       │
       ├── Attendance (출석)
       │
       └── Curriculum ── CurriculumWeek (주차별 내용)
```

### 6.2 주요 엔티티

#### User (사용자)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PK |
| email | String | 한국기술교육대학교 이메일 |
| password | String | 암호화된 비밀번호 |
| name | String | 이름 |
| role | Enum | ADMIN(교육장), REGULAR(레귤러), BEGINNER(비기너) |
| is_active | Boolean | 활성 상태 (쓰리아웃 시 비활성화) |
| created_at | DateTime | 가입일 |

#### Semester (기수)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PK |
| name | String | 기수명 (예: 26-상반기) |
| year | Integer | 연도 |
| half | Enum | FIRST(상반기), SECOND(하반기) |
| start_date | Date | 시작일 |
| end_date | Date | 종료일 |

#### Track (트랙)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PK |
| name | String | 트랙명 (FE, BE, Android, iOS, PM, DA, Design) |

#### SemesterTrack (기수-트랙)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PK |
| semester_id | Long | FK → Semester |
| track_id | Long | FK → Track |
| is_active | Boolean | 해당 기수에 모집 여부 |

#### UserSemesterTrack (사용자-기수-트랙 매핑)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PK |
| user_id | Long | FK → User |
| semester_track_id | Long | FK → SemesterTrack |
| role | Enum | 해당 기수-트랙에서의 역할 |
| is_active | Boolean | 활성 상태 (쓰리아웃 시 비활성화) |
| deactivated_reason | String | 비활성화 사유 (nullable) |
| deactivated_at | DateTime | 비활성화 일시 (nullable) |

#### Lecture (강의 자료)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PK |
| semester_track_id | Long | FK → SemesterTrack |
| title | String | 제목 |
| description | String | 설명 |
| week | Integer | 주차 |
| file_url | String | S3 파일 경로 |
| author_id | Long | FK → User |
| created_at | DateTime | 업로드일 |

#### Report (보고서)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PK |
| semester_track_id | Long | FK → SemesterTrack |
| author_id | Long | FK → User |
| title | String | 제목 |
| content | Text | 본문 (Markdown) |
| week | Integer | 주차 |
| status | Enum | DRAFT(임시저장), SUBMITTED(제출) |
| submitted_at | DateTime | 제출 시간 |
| created_at | DateTime | 작성일 |
| updated_at | DateTime | 수정일 |

#### ReportDeadline (보고서 제출 기한)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PK |
| semester_track_id | Long | FK → SemesterTrack |
| week | Integer | 주차 |
| deadline | DateTime | 제출 마감일 |
| allow_late_edit | Boolean | 기한 후 수정 허용 여부 |

#### ReportComment (보고서 피드백)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PK |
| report_id | Long | FK → Report |
| author_id | Long | FK → User |
| content | String | 코멘트 내용 |
| type | Enum | INLINE(인라인), GENERAL(전체) |
| selection_start | Integer | 인라인 코멘트 시작 위치 (nullable) |
| selection_end | Integer | 인라인 코멘트 끝 위치 (nullable) |
| selected_text | String | 선택된 텍스트 (nullable) |
| parent_id | Long | 답글 대상 코멘트 ID (nullable) |
| is_resolved | Boolean | 해결 여부 |
| created_at | DateTime | 작성일 |

#### Attendance (출석)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PK |
| semester_track_id | Long | FK → SemesterTrack |
| user_id | Long | FK → User (비기너) |
| week | Integer | 주차 |
| status | Enum | PRESENT(출석), ABSENT(결석), EXCUSED(공결) |
| excuse_reason | String | 공결 사유 (nullable) |
| excuse_approved | Boolean | 공결 승인 여부 (nullable) |
| checked_by | Long | FK → User (체크한 사람) |
| created_at | DateTime | 기록일 |

#### Curriculum (커리큘럼)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PK |
| semester_track_id | Long | FK → SemesterTrack |
| week | Integer | 주차 |
| topic | String | 주제 |
| description | Text | 내용 |
| created_at | DateTime | 작성일 |

---

## 7. API 설계 (주요 엔드포인트)

### 7.1 인증
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/auth/login | 로그인 |
| POST | /api/auth/logout | 로그아웃 |
| POST | /api/auth/refresh | 토큰 갱신 |
| POST | /api/auth/invite | 회원 초대 (교육장) |
| POST | /api/auth/register | 초대 기반 회원가입 |
| POST | /api/auth/password/reset-request | 비밀번호 재설정 요청 |
| POST | /api/auth/password/reset | 비밀번호 재설정 |

### 7.2 사용자
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/users/me | 내 정보 조회 |
| PUT | /api/users/me | 내 정보 수정 |
| GET | /api/users | 회원 목록 (교육장) |
| PUT | /api/users/{id}/role | 역할 변경 (교육장) |
| PUT | /api/users/{id}/deactivate | 비기너 비활성화 (교육장) |
| GET | /api/users/{id}/violations | 위반 횟수 조회 (결석+미제출) |

### 7.3 기수/트랙
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/semesters | 기수 생성 (교육장) |
| GET | /api/semesters | 기수 목록 조회 |
| GET | /api/semesters/{id}/tracks | 기수별 트랙 조회 |
| POST | /api/semesters/{id}/tracks | 기수-트랙 활성화 (교육장) |

### 7.4 강의 자료
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/lectures | 강의 자료 목록 |
| GET | /api/lectures/{id} | 강의 자료 상세 |
| POST | /api/lectures | 강의 자료 업로드 (교육장/레귤러) |
| PUT | /api/lectures/{id} | 강의 자료 수정 |
| DELETE | /api/lectures/{id} | 강의 자료 삭제 |

### 7.5 보고서
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/reports | 보고서 목록 |
| GET | /api/reports/{id} | 보고서 상세 |
| POST | /api/reports | 보고서 작성 |
| PUT | /api/reports/{id} | 보고서 수정 |
| PUT | /api/reports/{id}/submit | 보고서 제출 |
| POST | /api/reports/{id}/comments | 코멘트 작성 |
| GET | /api/reports/{id}/comments | 코멘트 목록 |
| PUT | /api/reports/comments/{id}/resolve | 코멘트 해결 |
| POST | /api/report-deadlines | 제출 기한 설정 (교육장) |

### 7.6 출석
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/attendances | 출석 체크 (교육장/레귤러) |
| GET | /api/attendances | 출석 현황 조회 |
| GET | /api/attendances/me | 내 출석 현황 |
| PUT | /api/attendances/{id} | 출석 상태 수정 |
| POST | /api/attendances/{id}/excuse | 공결 신청 |
| PUT | /api/attendances/{id}/excuse/approve | 공결 승인 (교육장/레귤러) |

### 7.7 커리큘럼
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/curriculums | 커리큘럼 목록 |
| GET | /api/curriculums/{id} | 커리큘럼 상세 |
| POST | /api/curriculums | 커리큘럼 생성 (교육장) |
| PUT | /api/curriculums/{id} | 커리큘럼 수정 (교육장) |
| DELETE | /api/curriculums/{id} | 커리큘럼 삭제 (교육장) |

---

## 8. 프로젝트 구조

```
BCSD_EDUCATION/
├── docs/                    # 문서
│   └── PRD.md
├── backend/                 # Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/bcsd/education/
│   │   │   │   ├── domain/          # 도메인별 패키지
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── user/
│   │   │   │   │   ├── semester/
│   │   │   │   │   ├── track/
│   │   │   │   │   ├── lecture/
│   │   │   │   │   ├── report/
│   │   │   │   │   ├── attendance/
│   │   │   │   │   └── curriculum/
│   │   │   │   ├── global/           # 공통 설정
│   │   │   │   │   ├── config/
│   │   │   │   │   ├── security/
│   │   │   │   │   ├── exception/
│   │   │   │   │   └── common/
│   │   │   │   └── EducationApplication.java
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   ├── build.gradle
│   └── settings.gradle
├── frontend/                # React
│   ├── src/
│   │   ├── api/             # API 통신
│   │   ├── components/      # 공통 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── lecture/
│   │   │   ├── report/
│   │   │   ├── attendance/
│   │   │   ├── curriculum/
│   │   │   └── admin/
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── store/           # 상태 관리
│   │   ├── types/           # 타입 정의
│   │   └── utils/           # 유틸리티
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 9. 비기능 요구사항

### 9.1 보안
- 비밀번호는 BCrypt로 암호화 저장
- JWT 기반 인증 (Access Token: 30분, Refresh Token: 7일)
- 이메일 도메인 검증 (`@koreatech.ac.kr`)
- API 권한 검증 (역할 기반)

### 9.2 파일 관리
- 모든 파일(강의 자료, 보고서 이미지)은 AWS S3에 저장
- 파일 크기 제한: 50MB
- S3 Presigned URL을 통한 파일 업로드/다운로드

### 9.3 에디터
- 보고서 작성용 마크다운 에디터
- 코드 블록 구문 강조 지원
- 이미지 업로드 (S3 연동)
- 인라인 코멘트를 위한 텍스트 선택 기능

---

## 10. 구현 Phase

### Phase 1: 프로젝트 초기 설정 및 인프라

> 모든 기능의 기반이 되는 프로젝트 구조, DB, 인증 시스템을 구축한다.

#### BE 작업
- [ ] Spring Boot 프로젝트 초기화 (Gradle, 패키지 구조)
- [ ] MySQL 연동 및 JPA 설정
- [ ] 공통 응답 포맷, 예외 처리 핸들러 구성
- [ ] Spring Security + JWT 인증/인가 필터 구현
- [ ] AWS S3 연동 설정 (파일 업로드/다운로드 공통 서비스)
- [ ] User 엔티티 및 Role Enum 정의
- [ ] AWS SES 연동 이메일 발송 서비스 구현 (초대, 비밀번호 재설정)

#### FE 작업
- [ ] React + TypeScript 프로젝트 초기화 (Vite)
- [ ] 프로젝트 폴더 구조 세팅 (api, components, pages, hooks, store, types)
- [ ] API 클라이언트 설정 (Axios, 인터셉터, JWT 토큰 관리)
- [ ] 라우팅 설정 (React Router)
- [ ] 공통 레이아웃 컴포넌트 (GNB, 사이드바, 푸터)
- [ ] 인증 상태 관리 (로그인/로그아웃 상태, 토큰 저장)

---

### Phase 2: 회원 관리

> 로그인, 회원가입, 비밀번호 찾기 등 사용자 인증 흐름을 완성한다.

#### BE 작업
- [ ] 로그인 API (`POST /api/auth/login`) — JWT 발급
- [ ] 로그아웃 API (`POST /api/auth/logout`) — 토큰 무효화
- [ ] 토큰 갱신 API (`POST /api/auth/refresh`)
- [ ] 회원 초대 API (`POST /api/auth/invite`) — 초대 토큰 생성, 이메일 발송
- [ ] 초대 기반 회원가입 API (`POST /api/auth/register`) — 토큰 검증, 도메인 검증
- [ ] 비밀번호 재설정 요청 API (`POST /api/auth/password/reset-request`)
- [ ] 비밀번호 재설정 API (`POST /api/auth/password/reset`)
- [ ] 내 정보 조회/수정 API (`GET/PUT /api/users/me`)
- [ ] 회원 목록 조회 API (`GET /api/users`) — 교육장 전용
- [ ] 역할 변경 API (`PUT /api/users/{id}/role`) — 교육장 전용

#### FE 작업
- [ ] 로그인 페이지 (이메일/비밀번호 폼, 유효성 검증)
- [ ] 비밀번호 찾기 페이지 (이메일 입력 → 재설정 링크 발송)
- [ ] 비밀번호 재설정 페이지 (토큰 기반)
- [ ] 초대 기반 회원가입 페이지 (초대 링크 → 정보 입력)
- [ ] 마이페이지 (내 정보 조회/수정)
- [ ] 회원 관리 페이지 — 교육장 전용 (목록, 역할 변경)

---

### Phase 3: 기수/트랙 관리

> 기수, 트랙, 사용자-기수-트랙 매핑을 관리하는 기능을 구현한다.

#### BE 작업
- [ ] Semester 엔티티 및 CRUD API
- [ ] Track 엔티티 및 조회 API (7개 트랙 초기 데이터)
- [ ] SemesterTrack 엔티티 및 활성화/비활성화 API
- [ ] UserSemesterTrack 엔티티 및 매핑 API (사용자를 기수-트랙에 배정)
- [ ] 기수별 트랙 조회 API (`GET /api/semesters/{id}/tracks`)
- [ ] 기수-트랙별 소속 회원 조회 API

#### FE 작업
- [ ] 기수 관리 페이지 — 교육장 전용 (생성, 목록)
- [ ] 트랙 활성화/비활성화 UI (기수별 트랙 토글)
- [ ] 회원-트랙 배정 UI (비기너를 특정 기수-트랙에 등록)
- [ ] GNB에 현재 기수/트랙 선택기 추가

---

### Phase 4: 커리큘럼

> 트랙별 주차 커리큘럼을 관리하고 조회하는 기능을 구현한다.

#### BE 작업
- [ ] Curriculum 엔티티 정의
- [ ] 커리큘럼 생성 API (`POST /api/curriculums`) — 교육장 전용
- [ ] 커리큘럼 조회 API (`GET /api/curriculums`) — 기수-트랙 필터
- [ ] 커리큘럼 수정 API (`PUT /api/curriculums/{id}`) — 교육장 전용
- [ ] 커리큘럼 삭제 API (`DELETE /api/curriculums/{id}`) — 교육장 전용
- [ ] 현재 진행 주차 산출 로직 (기수 시작일 기준)

#### FE 작업
- [ ] 커리큘럼 목록 페이지 (트랙별 주차 목록, 현재 주차 강조)
- [ ] 커리큘럼 상세 보기 (주제, 내용)
- [ ] 커리큘럼 작성/수정 폼 — 교육장 전용

---

### Phase 5: 강의 자료

> 강의 자료를 S3에 업로드하고 조회/다운로드하는 기능을 구현한다.

#### BE 작업
- [ ] Lecture 엔티티 정의
- [ ] 강의 자료 업로드 API (`POST /api/lectures`) — S3 Presigned URL 발급
- [ ] 강의 자료 목록 조회 API (`GET /api/lectures`) — 기수-트랙-주차 필터
- [ ] 강의 자료 상세 조회 API (`GET /api/lectures/{id}`)
- [ ] 강의 자료 수정 API (`PUT /api/lectures/{id}`) — 작성자/교육장만
- [ ] 강의 자료 삭제 API (`DELETE /api/lectures/{id}`) — 작성자/교육장만

#### FE 작업
- [ ] 강의 자료 목록 페이지 (트랙/기수/주차 필터링)
- [ ] 강의 자료 상세 페이지 (PDF 미리보기, 다운로드 버튼)
- [ ] 강의 자료 업로드 폼 — 교육장/레귤러 (드래그 앤 드롭, S3 Presigned URL 업로드)

---

### Phase 6: 출석

> 출석 체크, 현황 조회, 공결 신청/승인 기능을 구현한다.

#### BE 작업
- [ ] Attendance 엔티티 정의
- [ ] 출석 체크 API (`POST /api/attendances`) — 비기너 목록 일괄 체크
- [ ] 출석 현황 조회 API (`GET /api/attendances`) — 기수-트랙-주차 필터
- [ ] 내 출석 현황 API (`GET /api/attendances/me`)
- [ ] 출석 상태 수정 API (`PUT /api/attendances/{id}`)
- [ ] 공결 신청 API (`POST /api/attendances/{id}/excuse`)
- [ ] 공결 승인/거절 API (`PUT /api/attendances/{id}/excuse/approve`)
- [ ] 출석률 통계 산출 로직

#### FE 작업
- [ ] 출석 체크 페이지 — 교육장/레귤러 (비기너 목록 + 출석/결석/공결 선택)
- [ ] 내 출석 현황 페이지 — 비기너 (주차별 출석 상태, 출석률)
- [ ] 전체 출석 현황 페이지 — 교육장/레귤러 (비기너별 출석 테이블)
- [ ] 공결 신청 모달 — 비기너 (사유 입력)
- [ ] 공결 승인/거절 UI — 교육장/레귤러

---

### Phase 7: 보고서

> 마크다운 에디터 기반 보고서 작성, 제출, 기한 관리 기능을 구현한다.

#### BE 작업
- [ ] Report, ReportDeadline 엔티티 정의
- [ ] 보고서 작성 API (`POST /api/reports`) — 임시저장 지원
- [ ] 보고서 목록 조회 API (`GET /api/reports`) — 기수-트랙-주차 필터
- [ ] 보고서 상세 조회 API (`GET /api/reports/{id}`)
- [ ] 보고서 수정 API (`PUT /api/reports/{id}`)
- [ ] 보고서 제출 API (`PUT /api/reports/{id}/submit`) — 기한 검증
- [ ] 제출 기한 설정 API (`POST /api/report-deadlines`) — 교육장 전용
- [ ] 보고서 이미지 업로드 API — S3 Presigned URL 발급
- [ ] 제출 현황 산출 로직 (정시/지각/미제출)

#### FE 작업
- [ ] 보고서 목록 페이지 (제출 상태 뱃지: 임시저장/정시제출/지각/미제출)
- [ ] 보고서 작성/편집 페이지 (마크다운 에디터, 이미지 업로드, 실시간 미리보기)
- [ ] 보고서 상세 페이지 (마크다운 렌더링)
- [ ] 보고서 제출 확인 모달 (임시저장 ↔ 최종제출)
- [ ] 제출 기한 설정 폼 — 교육장 전용
- [ ] 보고서 제출 현황 대시보드 — 교육장/레귤러 (비기너별 제출 상태)

---

### Phase 8: 보고서 리뷰 및 피드백

> 인라인 코멘트, 전체 코멘트, 답글, 해결 기능을 구현한다.

#### BE 작업
- [ ] ReportComment 엔티티 정의 (인라인/전체, 답글, 해결)
- [ ] 코멘트 작성 API (`POST /api/reports/{id}/comments`) — 인라인/전체 구분
- [ ] 코멘트 목록 조회 API (`GET /api/reports/{id}/comments`)
- [ ] 코멘트 해결 API (`PUT /api/reports/comments/{id}/resolve`)
- [ ] 코멘트 답글 API (parent_id 기반)

#### FE 작업
- [ ] 보고서 상세 페이지에 인라인 코멘트 기능 추가 (텍스트 선택 → 코멘트 팝오버)
- [ ] 전체 코멘트 사이드 패널
- [ ] 코멘트 답글 스레드 UI
- [ ] 코멘트 해결(resolve) 토글

---

### Phase 9: 쓰리아웃 및 비활성화

> 위반 횟수 자동 집계, 쓰리아웃 표시, 비활성화 처리 기능을 구현한다.

#### BE 작업
- [ ] 위반 횟수 조회 API (`GET /api/users/{id}/violations`) — 결석 + 미제출 합산
- [ ] 비기너 비활성화 API (`PUT /api/users/{id}/deactivate`) — 교육장 전용
- [ ] 비활성화된 사용자 활동 제한 로직 (인가 필터)
- [ ] 쓰리아웃 대상자 목록 조회 API

#### FE 작업
- [ ] 회원 관리 페이지에 위반 횟수 컬럼 추가 (경고 색상 표시)
- [ ] 쓰리아웃 대상자 하이라이트 및 비활성화 버튼
- [ ] 비활성화 사유 입력 모달
- [ ] 비활성화된 비기너 표시 (비활성 뱃지)

---

### Phase 10: 대시보드 및 마무리

> 홈 대시보드, 전체 UI 통합, 테스트, 배포 준비를 진행한다.

#### BE 작업
- [ ] 대시보드 집계 API (이번 주 커리큘럼, 미제출 보고서, 최근 자료)
- [ ] API 통합 테스트 작성
- [ ] 배포 환경 설정 (application-prod.yml, Docker 등)

#### FE 작업
- [ ] 대시보드 페이지 (현재 기수/트랙, 이번 주 커리큘럼, 미제출 보고서, 최근 자료)
- [ ] 역할별 UI 분기 통합 검증 (교육장/레귤러/비기너별 접근 제어)
- [ ] 전체 페이지 UI/UX 검수
- [ ] 빌드 및 배포 설정

---

### Phase 요약

| Phase | 기능 | 의존성 |
|-------|------|--------|
| 1 | 프로젝트 초기 설정 및 인프라 | 없음 |
| 2 | 회원 관리 | Phase 1 |
| 3 | 기수/트랙 관리 | Phase 2 |
| 4 | 커리큘럼 | Phase 3 |
| 5 | 강의 자료 | Phase 3 |
| 6 | 출석 | Phase 3 |
| 7 | 보고서 | Phase 3 |
| 8 | 보고서 리뷰 및 피드백 | Phase 7 |
| 9 | 쓰리아웃 및 비활성화 | Phase 6, 7 |
| 10 | 대시보드 및 마무리 | Phase 4~9 |

> **참고**: Phase 4, 5, 6, 7은 Phase 3 완료 후 병렬 진행 가능

---

## 11. 향후 확장 고려사항 (MVP 이후)

- 알림 기능 (보고서 기한 임박, 새 피드백, 쓰리아웃 경고 등)
- 보고서 통계 (제출률, 평균 점수 등)
- 모바일 반응형 UI
