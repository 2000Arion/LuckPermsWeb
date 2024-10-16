const { gitDescribeSync } = require('git-describe');
const hljs = require('highlight.js/lib/core');
const config = require('./config.json');

process.env.VUE_APP_GIT_HASH = gitDescribeSync().hash;

const hljsLanguages = [
  'java', ['yaml', 'yml'], ['ini', 'toml'],
  'json', 'sql', 'gradle', 'bash', 'xml',
  'nginx', ['plaintext', 'hocon', 'conf'],
];

function registerHljsLanguages() {
  for (let lang of hljsLanguages) {
    lang = [].concat(lang);
    const mod = require(`highlight.js/lib/languages/${lang[0]}`);
    for (const alias of lang) {
      hljs.registerLanguage(alias, mod);
    }
  }
}

module.exports = {
  publicPath: config.base,
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @use "sass:color";
          @import "@/scss/variables.scss";
          @import "@/scss/breakpoints.scss";
        `,
      },
    },
  },
  chainWebpack: (webpackConfig) => {
    registerHljsLanguages();
    webpackConfig.module
      .rule('md')
      .test(/\.md$/)
      .use('vue-loader')
      .loader('vue-loader')
      .end()
      .use('@lucko/vue-markdown-loader')
      .loader('@lucko/vue-markdown-loader/lib/markdown-compiler')
      .options({
        raw: true,
        linkify: false,
        use: [
          // eslint-disable-next-line global-require
          [require('markdown-it-anchor'), {
            permalink: true,
            permalinkSymbol: '🔗',
            slugify: s => String(s).trim().toLowerCase().replace(/\s+/g, '-')
              .replace(/([^\w-]+)/g, ''),
          }],
          // eslint-disable-next-line global-require
          require('markdown-it-emoji'),
          // eslint-disable-next-line global-require
          [require('markdown-it-highlightjs'), { hljs }],
        ],
      });
  },
};
