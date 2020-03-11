function getParentSelector(rule) {
    if (!rule.selector) return ''
    var parentSelector = getParentSelector(rule.parent)
    if (!parentSelector) return rule.selector
    return parentSelector + ' ' + rule.selector
}

module.exports = getParentSelector
