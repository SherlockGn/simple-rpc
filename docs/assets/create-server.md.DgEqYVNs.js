import{_ as s,c as e,o as i,a1 as a}from"./chunks/framework.C46D9NsM.js";const g=JSON.parse('{"title":"createServer(options)","description":"","frontmatter":{},"headers":[],"relativePath":"create-server.md","filePath":"create-server.md"}'),t={name:"create-server.md"},r=a(`<h1 id="createserver-options" tabindex="-1">createServer(options) <a class="header-anchor" href="#createserver-options" aria-label="Permalink to &quot;createServer(options)&quot;">​</a></h1><p>Example:</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createServer } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@neko/simple-rpc&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> fs </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;fs&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> server</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createServer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    port: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8080</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    host: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;0.0.0.0&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    keepAlive: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    key: fs.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">readFileSync</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;test/fixtures/keys/agent2-key.pem&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    cert: fs.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">readFileSync</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;test/fixtures/keys/agent2-cert.pem&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>Creates a new server instance.</p><h2 id="options" tabindex="-1">options <a class="header-anchor" href="#options" aria-label="Permalink to &quot;options&quot;">​</a></h2><p>The options used to create or starts the server. If not specified, all default values will be used.</p><ul><li><code>options.port</code>: The port number to listen on. Defaults to 8080.</li></ul><p>For other properties in <code>options</code>, like: <code>host</code>, <code>keepAlive</code>, <code>key</code>, <code>cert</code>, etc., see:</p><ul><li><a href="https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener" target="_blank" rel="noreferrer">HTTPS create server options</a></li><li><a href="https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener" target="_blank" rel="noreferrer">HTTP create server options</a></li><li><a href="https://nodejs.org/api/net.html#serverlistenoptions-callback" target="_blank" rel="noreferrer">Listen options of the server</a></li></ul><p>The function returns a server object, to get the APIs of the server, see: <a href="./server.html">Server</a></p>`,10),n=[r];function p(l,h,o,k,c,d){return i(),e("div",null,n)}const y=s(t,[["render",p]]);export{g as __pageData,y as default};
