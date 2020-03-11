const parseImportLess = require('./parseImportLess');
const getParentSelector = require('./getParentSelector');

async function parseLessTree(root, tree, opts, alreadyImport) {
  if (opts.handleImportLess) {
    var result = await parseImportLess(root.source, tree, opts, alreadyImport);
    if (result) console.error(result)
  }
  root.walkRules(function(rule) {
    var parentSelector = getParentSelector(rule.parent);
    var selector = (parentSelector ? parentSelector + ' ' : '') + rule.selector;
    var children = [];
    tree.push({
      selector,
      children
    })
    let currentSelector = rule.selector
    rule.walkDecls(function(decl) {
      if (
        // exclude
        decl.value.indexOf('~@') === -1 &&
        decl.value.indexOf('@') > -1 &&
        decl.parent.selector === currentSelector)
        children.push(decl.prop + ': ' + decl.value + ';')
    })
  })
}

module.exports = parseLessTree
