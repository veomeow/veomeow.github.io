---
title: "fuzzer와 fuzzing"
category: "블로그/기술문서/리서치"
date: "2026-11-24"
tags:
  - Knights Frontier 3기
  - fuzzing
  - fuzzer
thumbnail: "/assets/img/thumbnail/nyang.png"
---

## 미션 목표
퍼징이 무엇인지 공부하고 여러가지 퍼저에 대해 알아보자

## fuzzing이란

퍼징(fuzzing)이란, 프로그램이나 시스템에 다양한 데이터를 반복적으로 입력하여 프로그램이 의도하지 않은 동작이나 에러, 충돌, 메모리 오류 등을 찾아내는 소프트웨어 테스트 기법입니다.

퍼징을 통해 Buffer Overflow, Use-After-Free 등의 메모리 오류나 프로그램의 비정상 종료 등을 탐지할 수 있습니다.

### fuzzing 동작 과정

퍼징은 일반적으로 다음과 같은 과정을 반복합니다.

1. **초기 입력값 준비** : 테스트에 사용할 초기 데이터(Seed)를 준비
2. **입력값 생성 및 변형** : 기존 데이터를 변형하거나 새로운 데이터 생성
3. **프로그램 실행** : 생성한 입력값을 테스트 대상에 전달
4. **결과 확인** : 프로그램의 충돌, 오류, 실행 정보 등을 확인
5. **반복** : 입력값을 변경하여 테스트를 반복하고, 필요한 경우 유의미한 입력값을 저장

<span style="color: var(--text-muted-color);">이때 퍼징에 사용되는 입력 데이터의 집합을 <strong>Corpus</strong>라고 합니다.</span>

모든 퍼저가 동일한 방식으로 동작하는 것은 아니며, 일부 퍼저는 프로그램의 실행 결과를 활용하여 다음 입력값을 개선하기도 합니다.

### fuzzing 종류

퍼징의 종류는 입력값 생성 방식과 프로그램 내부 정보를 활용하는 정도에 따라 구분할 수 있습니다.

#### 입력값 생성 방식

퍼징은 입력값 생성 방식을 기준으로 크게 두 가지로 구분할 수 있습니다.

**Mutation-based fuzzing**

: 기존 입력 데이터(Seed)를 기반으로 데이터를 변형하여 새로운 테스트 케이스를 생성하는 방식

기존 데이터의 일부 비트를 변경하거나 데이터를 추가·삭제하는 등의 방법을 사용합니다.

입력 형식에 대한 정보 없이도 사용할 수 있지만, 데이터가 손상되면 프로그램의 입력 검증 단계에서 거부될 수 있습니다.

**Generation-based fuzzing**

: 입력 포맷의 구조와 규칙을 바탕으로 새로운 테스트 케이스를 생성하는 방식

예를 들어 JSON을 처리하는 프로그램이라면 JSON 문법을 기반으로 다양한 필드와 값을 생성할 수 있습니다.

입력 형식에 대한 정보가 필요하지만, 복잡한 구조의 데이터를 생성하는 데 유용합니다.

두 방식이 반드시 구분되어 사용되는 것은 아닙니다. 실제 퍼저에서는 입력값의 구조를 고려하면서 기존 데이터를 변형하는 등 여러 방식을 함께 사용하기도 합니다.

#### 프로그램 내부 정보 사용 방식

퍼징은 프로그램 내부 정보 사용 방식을 기준으로 블랙박스 퍼징, 화이트박스 퍼징, 그레이박스 퍼징으로 구분할 수 있습니다.

- **Black-box fuzzing** : 타겟 프로그램의 내부 실행 정보를 활용하지 않고 입력과 실행 결과만을 이용하는 방식
- **White-box fuzzing** : 타겟 프로그램의 내부 구조와 실행 조건을 분석하여 입력값을 생성하는 방식
- **Gray-box fuzzing** : 타겟 프로그램의 내부 정보를 일부 활용하는 방식으로, 주로 코드 커버리지 등을 이용하여 새로운 실행 경로를 탐색하는 방식

Gray-box Fuzzing에서 대표적으로 활용하는 기법이 **Coverage-guided Fuzzing**입니다.

코드 커버리지(Code Coverage)는 테스트 과정에서 프로그램의 어느 부분이 실행되었는지를 나타내는 정보입니다.

Coverage-guided Fuzzing은 이러한 정보를 활용하여 새로운 코드 영역이나 실행 경로를 발견한 입력값을 저장하고, 이를 바탕으로 다음 테스트를 진행합니다.

예를 들어 특정 조건문을 통과하지 못했던 입력값을 변형하여 새로운 코드가 실행되었다면, 해당 입력값을 다음 테스트에 활용할 수 있습니다.

단순히 무작위 데이터를 입력하는 것이 아니라 이전 테스트에서 얻은 정보를 활용하는 것입니다.

### fuzzing 및 fuzzer 주요 용어

퍼징과 퍼저에 대해 알아보다보니 생소한 단어가 많았습니다... 그래서 퍼징, 퍼저 관련 용어들을 표로 간략히 정리해봤습니다.

| 용어 | 설명 |
| --- | --- |
| Fuzz Harness | 퍼저가 생성한 입력값을 테스트 대상에 전달하고 실행하도록 작성한 코드 |
| Mutator | 기존 입력값을 변형하여 새로운 테스트 케이스를 생성하는 구성 요소 |
| Seed Scheduling | 여러 Seed 중 어떤 입력값을 우선적으로 변형할지 결정하는 과정 |
| Corpus Minimization | 코드 커버리지를 최대한 유지하면서 중복되거나 불필요한 입력값을 제거하는 작업 |
| Input Minimization | 특정 실행 경로나 오류를 유지하면서 개별 입력값의 크기를 줄이는 작업 |
| Crash Deduplication | 동일한 원인으로 발생한 것으로 판단되는 Crash들을 분류하여 중복을 줄이는 작업 |
| Reproducer | 발견한 오류를 다시 발생시키는 데 사용하는 입력 데이터 |
{: style="width: 100%; table-layout: auto; word-break: keep-all;" }

---

## fuzzer란

퍼저(fuzzer)란 퍼징을 자동으로 수행하는 도구입니다.

퍼저마다 입력값을 생성하는 방식이나 실행 정보를 수집하는 방법, 주요 테스트 대상 등이 다릅니다.

AFL++, Jackalope, libFuzzer, syzkaller를 선정하여 알아보았습니다.

### fuzzer의 종류와 차이점

#### AFL++

AFL++(American Fuzzy Lop Plus Plus)는 기존 AFL을 확장한 Coverage-guided Fuzzer입니다.

기존 입력값을 변형하여 프로그램에 전달하고, 코드 커버리지를 이용하여 새로운 실행 경로를 탐색합니다.

AFL++는 실행 정보를 수집하기 위해 계측(Instrumentation)을 사용합니다.

소스 코드가 있다면 LLVM, GCC 등을 통해 컴파일 과정에서 계측을 적용할 수 있습니다. 소스 코드가 없는 바이너리도 QEMU나 Frida 등을 활용하여 계측할 수 있습니다.

또한 AFL++는 Forkserver와 Persistent Mode를 지원합니다.

- **Forkserver** : `fork()`로 자식 프로세스를 생성하여 테스트를 수행하고, 매번 프로그램을 처음부터 실행하는 비용을 줄이는 방식
- **Persistent Mode** : 하나의 프로세스에서 여러 입력값을 반복 처리하는 방식

AFL++는 소스 코드가 있는 프로그램뿐만 아니라 바이너리에도 활용할 수 있고, 다양한 계측 및 실행 방식을 지원합니다.

#### Jackalope

Jackalope는 Google Project Zero에서 개발한 바이너리 대상 Coverage-guided Fuzzer입니다.

소스 코드가 없는 바이너리도 퍼징할 수 있으며, 기본적으로 **TinyInst**를 이용하여 코드 커버리지를 수집합니다.

TinyInst는 프로그램 실행 중 바이너리 코드를 동적으로 계측하는 도구입니다. 따라서 소스 코드를 수정하거나 다시 컴파일하지 않고도 실행 정보를 수집할 수 있습니다.

Jackalope는 다음과 같은 구성 요소를 사용합니다.

- **Mutator** : 입력값을 변형하여 새로운 테스트 케이스 생성
- **Instrumentation** : 바이너리를 계측하고 커버리지 정보 수집
- **SampleDelivery** : 생성한 입력값을 테스트 대상에 전달

Jackalope는 이러한 구성 요소를 사용자가 직접 수정하거나 확장할 수 있습니다.

예를 들어 파일을 통해 입력값을 전달하기 어려운 프로그램이라면, SampleDelivery를 수정하여 해당 프로그램에 맞는 입력 전달 방식을 구현할 수 있습니다.

또한 파일 및 공유 메모리를 통한 입력 전달과 Persistent Mode 등을 지원합니다.

AFL++ 역시 바이너리 퍼징이 가능하지만, Jackalope는 **입력 전달 방식이나 계측 기능 등을 직접 변경할 수 있도록 설계되었다는 점**이 특징입니다.

#### libFuzzer

libFuzzer는 LLVM에서 제공하는 In-process Coverage-guided Fuzzer입니다.

AFL++와 마찬가지로 코드 커버리지를 활용하지만, 퍼저와 타겟 코드가 같은 프로세스에서 실행된다는 점이 특징입니다.

libFuzzer는 일반적으로 `LLVMFuzzerTestOneInput()` 함수를 통해 입력값을 전달합니다.

다음은 LLVM 공식 문서에서 제공하는 예제 코드입니다.

```cpp
#include <stdint.h>
#include <stddef.h>

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
  if (size > 0 && data[0] == 'H')
    if (size > 1 && data[1] == 'I')
      if (size > 2 && data[2] == '!')
        __builtin_trap();
  return 0;
}
```

출처 : [https://llvm.org/docs/LibFuzzer.html](https://llvm.org/docs/LibFuzzer.html)

위 코드는 입력값의 처음 3바이트가 `HI!`일 때 `__builtin_trap()`을 실행하는 예제입니다. (`HI!asdf`여도 실행함.)

libFuzzer는 입력값을 반복적으로 변형하면서 해당 조건에 도달하는지 테스트합니다. 이 코드는 퍼징 동작을 보여주기 위해 의도적으로 종료를 발생시키는 예제입니다.

이처럼 퍼저가 생성한 입력값을 테스트 대상에 전달하는 코드를 **Harness**라고 합니다.

libFuzzer는 Harness를 반복 호출하므로 테스트마다 별도의 프로세스를 생성할 필요가 없습니다.

다만 같은 프로세스에서 여러 입력값을 처리하므로 이전 테스트에서 변경된 상태가 다음 테스트에 영향을 주지 않도록 주의해야 합니다.

또한 AddressSanitizer와 함께 사용하여 메모리 접근 오류 등을 탐지할 수 있습니다.

#### syzkaller

syzkaller는 운영체제 커널을 대상으로 하는 Coverage-guided Fuzzer입니다.

일반적인 프로그램에 파일이나 문자열을 입력하는 것과 달리, System Call을 조합하여 커널의 동작을 테스트합니다.

예를 들어 파일을 새로 열어 읽는 경우 `open()`으로 파일 디스크립터를 얻은 후, 이를 `read()`에 전달할 수 있습니다.

이처럼 시스템 콜 사이에는 호출 순서와 자원 의존성이 존재합니다. 따라서 커널 퍼징에서는 시스템 콜의 인자뿐만 아니라 호출 순서와 자원 관계도 고려해야 합니다.

syzkaller는 **syzlang**이라는 기술 언어를 사용하여 시스템 콜의 인자와 자원 관계 등을 정의합니다.

이를 바탕으로 여러 시스템 콜의 호출 순서를 구성하고, 인자나 호출 구성을 변형하여 커널을 테스트합니다.

또한 Linux에서는 **KCOV**를 이용하여 커널의 코드 커버리지를 수집합니다.

KCOV는 커널의 코드 커버리지 정보를 사용자 공간에 제공하는 기능으로, syzkaller는 이를 이용하여 새로운 실행 경로를 탐색합니다.

syzkaller는 단순히 무작위 시스템 콜을 호출하는 것이 아니라, 시스템 콜의 구조와 자원 관계를 고려하여 커널을 테스트한다는 특징이 있습니다.

### fuzzer 비교

| Fuzzer | 주요 대상 | 입력값 생성 방식 | 커버리지 수집 |
| --- | --- | --- | --- |
| AFL++ | 프로그램 및 바이너리 | Mutation 중심 | LLVM, GCC, QEMU, Frida 등 |
| Jackalope | 바이너리 | Mutation 중심, 문법 기반 변형도 지원 | TinyInst 등 |
| libFuzzer | 함수 및 라이브러리 | Mutation 중심 | LLVM SanitizerCoverage |
| syzkaller | 운영체제 커널 | 시스템 콜 기반 생성·변형 | KCOV 등 |
{: style="width: 100%; table-layout: auto; word-break: keep-all;" }

네 가지 퍼저 모두 코드 커버리지를 활용하지만, 테스트 대상과 실행 방식에는 차이가 있습니다.

AFL++와 Jackalope는 바이너리 퍼징이 가능하다는 공통점이 있습니다. 다만 AFL++는 여러 계측 및 실행 방식을 지원하고, Jackalope는 사용자가 퍼징 구성 요소를 직접 수정할 수 있도록 설계되었습니다.

libFuzzer는 함수를 같은 프로세스에서 반복 호출하며, syzkaller는 시스템 콜의 인자와 호출 순서 등을 구성하여 커널을 테스트합니다.

#### In-process & Persistent Mode

퍼저의 실행 방식을 살펴보면서 In-process와 Persistent Mode의 차이가 헷갈려서 정리해봤습니다.

- **In-process** : 퍼저의 테스트 실행 코드와 타겟 코드가 동일한 프로세스에서 실행되는 방식
- **Out-of-process** : 퍼저와 타겟이 별도의 프로세스에서 실행되는 방식
- **Persistent Mode** : 타겟 프로세스를 재사용하여 여러 입력값을 반복 처리하는 방식

In-process는 실행 위치, Persistent Mode는 프로세스 재사용 여부에 대한 개념이었습니다!

그러니까 둘은 서로 배타적인 개념이 아니었음….

---

## 정리

퍼징은 단순히 무작위 데이터를 반복 입력하는 것이 아니라, 입력 데이터의 구조나 코드 커버리지 등의 정보를 활용하여 테스트를 수행할 수 있다는 것을 알게 되었습니다.

또한 퍼저마다 테스트 대상이 일반 프로그램, 바이너리, 함수 및 라이브러리, 운영체제 커널 등 다양하다는 것을 알 수 있었습니다. 이렇게 테스트 대상이 다르기 때문에 입력값을 생성하거나 전달하는 방식에도 차이가 있었습니다.

특히 syzkaller를 통해 커널 퍼징에서는 시스템 콜의 인자뿐만 아니라 호출 순서와 자원 관계도 중요하다는 점을 알게 되었습니다. 개인적으로 커널에서 일어나는 일에 관심이 있어서 syzkaller를 조사할 때 어렵긴 했지만 재밌었습니다!!

## 참고 자료

- [https://aflplus.plus/docs/](https://aflplus.plus/docs/)
- [https://aflplus.plus/docs/technical_details/](https://aflplus.plus/docs/technical_details/)
- [https://github.com/AFLplusplus/AFLplusplus](https://github.com/AFLplusplus/AFLplusplus)
- [https://github.com/googleprojectzero/Jackalope](https://github.com/googleprojectzero/Jackalope)
- [https://github.com/googleprojectzero/TinyInst](https://github.com/googleprojectzero/TinyInst)
- [https://llvm.org/docs/LibFuzzer.html](https://llvm.org/docs/LibFuzzer.html)
- [https://github.com/google/syzkaller](https://github.com/google/syzkaller)
- [https://docs.kernel.org/dev-tools/kcov.html](https://docs.kernel.org/dev-tools/kcov.html)
- [https://github.com/google/fuzzing/blob/master/docs/glossary.md](https://github.com/google/fuzzing/blob/master/docs/glossary.md)
