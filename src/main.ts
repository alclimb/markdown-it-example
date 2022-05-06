import MarkdownIt from "markdown-it";
import { escapeHtml } from "markdown-it/lib/common/utils";

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = markdownToHtml(`
## link

https://github.com/alclimb/markdown-it-example

## pre-code

\`\`\`js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
\`\`\`

## img

![](favicon.svg)
`);

function markdownToHtml(markdown: string) {
  const markdownIt = new MarkdownIt({
    breaks: true,
    linkify: true,
  });

  // aタグのカスタマイズ
  markdownIt.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    tokens[idx].attrPush(['target', '_blank']);           // 別のタブで開く指定を追加
    tokens[idx].attrPush(['rel', 'noopener noreferrer']); // 外部サイトからのセキュリティ対策
    return self.renderToken(tokens, idx, options);
  };

  // pre-codeタグのカスタマイズ
  markdownIt.renderer.rules.fence = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    console.log(`token.info="${token.info}"`);       // => token.info="js"
    console.log(`token.content="${token.content}"`); // pre-codeの内容

    return `<pre ${slf.renderAttrs(token)}><code class="language-${token.info}">${escapeHtml(token.content)}</code></pre>\n`;
  }

  // imgタグのカスタマイズ
  markdownIt.renderer.rules.image = (tokens, idx, options, env, self) => {
    const title = tokens[idx].attrGet(`title`) ?? ``;
    const alt = tokens[idx].attrGet(`alt`) ?? ``;
    const src = tokens[idx].attrGet(`src`) ?? ``;

    // 拡張子を取得
    const [ext] = src.split(`.`).reverse();

    // 拡張子を判定
    if (ext === `mp4`) {
      // 動画の場合
      return `<video controls width="100%" autoplay loop muted="true" src="${src}" type="video/mp4"></video>`;
    }
    else {
      // 画像の場合
      return `<a href="${src}" target="_blank"><img src="${src}" title="${title}" alt="${alt}" loading="lazy"></a>`;
    }
  };

  return markdownIt.render(markdown);
}
