# claude-blueprint-helix

> 반복적 개선을 통한 체계적 개발: Claude Code를 위한 PDCA 사이클, 갭 분석, 개발 파이프라인

AI 지원 프로그래밍에 구조화된 개발 방법론을 도입하는 Claude Code 플러그인입니다. 지속적 개선 사이클, 체계적 갭 분석, 단계별 개발 파이프라인을 통해 더 나은 소프트웨어를 만드세요.

## 주요 기능

- **PDCA 사이클** (`/blueprint:pdca`) - 지속적 개선을 위한 반복적 Plan-Do-Check-Act 루프
- **갭 분석** (`/blueprint:gap`) - 현재 상태와 목표 상태 비교 및 심각도 기반 리포트
- **개발 파이프라인** (`/blueprint:pipeline`) - 3/6/9단계 구조화 개발 워크플로우
- **취소** (`/blueprint:cancel`) - 실행 중인 사이클 및 파이프라인의 우아한 종료

## 설치

```bash
claude plugin add quantsquirrel/claude-blueprint-helix
```

## 빠른 시작

### PDCA 사이클

코드베이스에서 반복적 개선 사이클 실행:

```
/blueprint:pdca "인증 모듈의 에러 핸들링 개선" --iterations 3
```

각 사이클:
1. **Plan** - 현재 상태 분석 및 개선 계획 수립
2. **Do** - 변경사항 구현
3. **Check** - 목표 달성 여부 검증
4. **Act** - 결과 검토 및 다음 반복 결정

### 갭 분석

현재 상태와 목표 상태 간의 격차 식별:

```
/blueprint:gap "API가 REST 규약을 따라야 함" --severity high
```

다음을 포함한 상세 리포트 생성:
- 현재 상태 분석
- 목표 상태 명세
- 심각도별 갭 식별 (critical/high/medium/low)
- 실행 가능한 권장사항

### 개발 파이프라인

구조화된 개발 워크플로우 실행:

```
/blueprint:pipeline "사용자 인증 추가" --preset standard
```

사용 가능한 프리셋:
- **full** (9단계) - 모든 게이트를 포함한 완전한 워크플로우
- **standard** (6단계) - 균형잡힌 워크플로우 (기본값)
- **minimal** (3단계) - 작은 변경사항을 위한 빠른 반복

### 실행 중인 워크플로우 취소

실행 중인 사이클이나 파이프라인을 우아하게 중지:

```
/blueprint:cancel --all
```

## 스킬 참조

| 스킬 | 설명 | 주요 인자 |
|------|------|-----------|
| `/blueprint:pdca` | PDCA 개선 사이클 실행 | `--iterations N`, `--auto-act` |
| `/blueprint:gap` | 갭 분석 수행 | `--severity [critical\|high\|medium\|low]` |
| `/blueprint:pipeline` | 개발 파이프라인 실행 | `--preset [full\|standard\|minimal]` |
| `/blueprint:cancel` | 실행 중인 워크플로우 취소 | `--all`, `--cycle-id ID`, `--pipeline-id ID` |

## 파이프라인 프리셋

| 프리셋 | 단계 수 | 페이즈 | 적합한 용도 |
|--------|---------|--------|-------------|
| **full** | 9 | requirements → architecture → design → implementation → unit-test → integration-test → code-review → gap-analysis → verification | 중요 기능, 새로운 모듈 |
| **standard** | 6 | requirements → design → implementation → unit-test → code-review → verification | 대부분의 개발 작업 |
| **minimal** | 3 | design → implementation → verification | 빠른 수정, 작은 변경사항 |

## 아키텍처

### 구성 요소

- **6개 훅** - 라이프사이클 관리
  - `UserPromptSubmit` - 키워드 감지
  - `PostToolUse` - 진행 상황 추적
  - `SessionStart` - 상태 복원
  - `PreCompact` - 상태 보존
  - `Stop` - 우아한 종료
  - `SessionEnd` - 정리

- **3개 커스텀 에이전트** - 특화된 분석
  - `gap-detector` (opus) - 읽기 전용 갭 분석
  - `design-writer` (sonnet) - 설계 문서 생성
  - `pdca-iterator` (sonnet) - PDCA 사이클 오케스트레이션

- **1개 MCP 서버** - 외부 도구 접근
  - `pdca_status` - PDCA 사이클 상태 조회
  - `gap_measure` - 갭 메트릭 측정
  - `pipeline_progress` - 파이프라인 진행 상황 확인

### 상태 관리

상태 파일은 `.omc/blueprint/`에 저장됨:
- ID 기반 격리 (여러 사이클/파이프라인 동시 실행 가능)
- 락 프로토콜로 경쟁 조건 방지
- 종료 시 세션 정리
- 우아한 종료 지원

### 제로 의존성

Node.js 내장 기능만으로 구축:
- 외부 패키지 불필요
- 최소한의 설치 공간
- 빠른 시작 및 실행

## 설정

`config/` 디렉토리의 설정 파일:

### `pdca-defaults.json`

```json
{
  "max_iterations": 4,
  "phase_timeout_ms": 300000,
  "auto_act": false,
  "default_agents": {
    "plan": ["oh-my-claudecode:analyst", "blueprint-helix:pdca-iterator"],
    "do": ["oh-my-claudecode:executor"],
    "check": ["oh-my-claudecode:verifier"],
    "act": ["blueprint-helix:pdca-iterator"]
  }
}
```

### `pipeline-phases.json`

에이전트와 게이트 조건이 포함된 전체 9개 페이즈를 정의합니다. 워크플로우에 맞게 커스터마이즈 가능합니다.

## 사용 예시

### 반복적 성능 최적화

```
/blueprint:pdca "사용자 서비스의 데이터베이스 쿼리 성능 최적화" --iterations 4 --auto-act
```

각 반복마다 개선 사항을 측정하고 목표 달성 시 자동으로 진행합니다.

### 병합 전 품질 체크

```
/blueprint:gap "프로덕션 배포 준비 완료" --severity critical
```

병합 전 차단 이슈를 식별합니다.

### 전체 기능 개발

```
/blueprint:pipeline "OAuth2 인증 추가" --preset full
```

요구사항부터 검증까지 전체 9단계를 거칩니다.

## 라이선스

MIT 라이선스 - 자세한 내용은 [LICENSE](LICENSE)를 참조하세요.

## 저장소

[https://github.com/quantsquirrel/claude-blueprint-helix](https://github.com/quantsquirrel/claude-blueprint-helix)

---

체계적 소프트웨어 개발을 위해 만들어졌습니다
