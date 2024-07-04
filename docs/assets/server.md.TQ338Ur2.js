import{_ as s,c as i,o as e,a1 as a}from"./chunks/framework.C46D9NsM.js";const g=JSON.parse('{"title":"Server","description":"","frontmatter":{},"headers":[],"relativePath":"server.md","filePath":"server.md"}'),t={name:"server.md"},n=a(`<h1 id="server" tabindex="-1">Server <a class="header-anchor" href="#server" aria-label="Permalink to &quot;Server&quot;">​</a></h1><p>The server object is the returned value of function <code>createServer</code>.</p><h2 id="server-server" tabindex="-1">server.server <a class="header-anchor" href="#server-server" aria-label="Permalink to &quot;server.server&quot;">​</a></h2><p>The created native server instance.</p><h2 id="server-options" tabindex="-1">server.options <a class="header-anchor" href="#server-options" aria-label="Permalink to &quot;server.options&quot;">​</a></h2><p>The options passed to the <code>createServer</code>. The port number is also included in this object.</p><h2 id="server-useprotocol-protocol" tabindex="-1">server.useProtocol(protocol) <a class="header-anchor" href="#server-useprotocol-protocol" aria-label="Permalink to &quot;server.useProtocol(protocol)&quot;">​</a></h2><p>Specifies which protocol to use. Must be one of <code>&#39;http&#39;</code>, <code>&#39;https&#39;</code> or <code>null</code>. Defaults to <code>null</code>. If set <code>null</code>, the server will determine the protocol based on the <code>options.key</code> and <code>options.cert</code>.</p><h2 id="server-userpc-folder" tabindex="-1">server.useRpc(folder) <a class="header-anchor" href="#server-userpc-folder" aria-label="Permalink to &quot;server.useRpc(folder)&quot;">​</a></h2><p>Specifies the folder path of the RPC modules. See <a href="./quick-start.html">Quick Start</a> for the example.</p><h2 id="server-usecors-origins" tabindex="-1">server.useCors(origins) <a class="header-anchor" href="#server-usecors-origins" aria-label="Permalink to &quot;server.useCors(origins)&quot;">​</a></h2><p>Call this function to enable CORS. The parameter <code>origins</code> defaults to <code>*</code>. If you want to specify the allowed methods or headers, pass an object. For example:</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">server.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">useCors</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    origins: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;http://mydomain.com&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    methods: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;GET, POST&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    headers: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Content-Type, Authorization&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    credential: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><h2 id="server-usestatic-folder" tabindex="-1">server.useStatic(folder) <a class="header-anchor" href="#server-usestatic-folder" aria-label="Permalink to &quot;server.useStatic(folder)&quot;">​</a></h2><p>Specifies the folder path of the static files. The server will serve static files from the specified folder.</p><h2 id="server-useauth-async-ctx" tabindex="-1">server.useAuth(async ctx =&gt; { ... }) <a class="header-anchor" href="#server-useauth-async-ctx" aria-label="Permalink to &quot;server.useAuth(async ctx =&gt; { ... })&quot;">​</a></h2><p>Specifies the authentication middleware. The middleware will be called before executing the remote function.</p><p>You can get the module names, method names and parameters from the <code>ctx</code> object.</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">module</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">method</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">params</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">extra</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ctx</span></span></code></pre></div><p>For example, if you want to authorize each function call, we recommend you to write the code here, and set the user to <code>ctx.state</code>. In the exposed remote functions, you can use <code>this</code> to get the <code>ctx</code> variable. If you want to access <code>this</code>, do not use arrow functions.</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// server.js</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">server.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">useAuth</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">ctx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">next</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">module</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">method</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">params</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">extra</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ctx</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> user</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> checkToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(extra.token)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (user) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ctx.state </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> user</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Unauthorized&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// user.js</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">export </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getFriends</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // the variable ctx is injected to this</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> user</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.state.user</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> retriveFriends</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(user)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">client.extra </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> token</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> friends</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> client.user.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getFriends</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span></code></pre></div><h2 id="server-useerror-async-ctx-error" tabindex="-1">server.useError(async (ctx, error) =&gt; { ... }) <a class="header-anchor" href="#server-useerror-async-ctx-error" aria-label="Permalink to &quot;server.useError(async (ctx, error) =&gt; { ... })&quot;">​</a></h2><p>Specifies the error handler middleware. The middleware will be called when an error occurs.</p><h2 id="server-useend-async-ctx" tabindex="-1">server.useEnd(async ctx =&gt; { ... }) <a class="header-anchor" href="#server-useend-async-ctx" aria-label="Permalink to &quot;server.useEnd(async ctx =&gt; { ... })&quot;">​</a></h2><p>Specifies the end handler middleware. The middleware will be called when the remote function execution is completed.</p><p>Note: the static file handing or the browser preflight handing will not go to end handler middleware.</p><h2 id="async-server-start" tabindex="-1">async server.start() <a class="header-anchor" href="#async-server-start" aria-label="Permalink to &quot;async server.start()&quot;">​</a></h2><p>Starts the server.</p><h2 id="server-close" tabindex="-1">server.close() <a class="header-anchor" href="#server-close" aria-label="Permalink to &quot;server.close()&quot;">​</a></h2><p>Closes the server.</p>`,31),r=[n];function h(l,p,k,o,d,c){return e(),i("div",null,r)}const u=s(t,[["render",h]]);export{g as __pageData,u as default};