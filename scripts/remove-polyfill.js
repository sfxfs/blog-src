/**
 * Remove polyfill.io script from generated HTML.
 * polyfill.io was compromised in 2024 and serves malicious scripts.
 * Modern browsers support ES6 natively, so this polyfill is unnecessary.
 */
hexo.extend.filter.register('after_render:html', function (str) {
  return str.replace(
    /<script src="https:\/\/polyfill\.io\/v3\/polyfill\.min\.js\?features=es6"><\/script>/g,
    ''
  );
});
