# Muff1n

`https://vemeow.github.io`에 배포할 Jekyll 기술 블로그 소스입니다. Satellite 테마를 기반으로 밝은 우주 분위기, 6개 카테고리, 검색, TOC, 코드 복사, 다크 모드를 구성했습니다.

## 로컬 실행

```cmd
bundle install
bundle exec jekyll build
bundle exec jekyll serve
```

현재 Windows Ruby 4.0.9에서 절대 경로 `Dir.glob`이 빈 배열을 반환하는 환경이라면 프로젝트 한정 호환 래퍼를 사용합니다.

```cmd
bundle exec ruby scripts/jekyll-ruby4.rb build
bundle exec ruby scripts/jekyll-ruby4.rb serve
```

`wdm`은 Ruby 4 환경의 컴파일 문제를 피하기 위해 비활성화된 상태입니다.

## 카테고리와 글 작성

| 표시명 | 디렉터리 slug |
| --- | --- |
| 개발 | `development` |
| CTF/Wargame | `ctf-wargame` |
| Bug Bounty | `bug-bounty` |
| 블로그/기술문서 | `blog-tech-docs` |
| 논문/컨퍼런스 | `papers-conferences` |
| 공모전/자격증 | `competitions-certifications` |

글은 해당 디렉터리 아래에 Markdown 파일로 추가합니다.

```yaml
---
title: "게시글 제목"
category: 개발
date: "2026-10-31"
tags:
  - example
thumbnail: "/assets/img/thumbnail/example.webp"
---
```

실제 경험하지 않은 풀이·취약점·분석은 작성하지 않습니다.

## 배포

`.github/workflows/pages.yml`은 `main` 브랜치 push 시 GitHub Pages 공식 Jekyll 빌드 액션을 실행합니다. 대상 저장소의 **Settings → Pages → Source**를 **GitHub Actions**로 설정해야 합니다.

원본 테마: [byanko55/jekyll-theme-satellite](https://github.com/byanko55/jekyll-theme-satellite) (MIT License)
