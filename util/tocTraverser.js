import lightscript from 'babel-plugin-lightscript'

// note this is hacked; must add the following at line 720:
//   exports.defineType = _definitions.default;
//   exports.assertEach = _definitions.assertEach;
//   exports.assertOneOf = _definitions.assertOneOf;
//   exports.assertNodeType = _definitions.assertNodeType;
//   exports.assertNodeOrValueType = _definitions.assertNodeOrValueType;
//   exports.assertValueType = _definitions.assertValueType;
//   exports.chain = _definitions.chain;
import { transform } from 'babel-standalone'


export default tocTraverser(node) ->
  switch node.tagName {
    case 'li':
      firstChild := node.children.1
      if firstChild && firstChild.tagName == 'p':
        href := node.children.1.children.0.properties.href
        node.properties.section = href.replace('#', '')
        node.tagName = 'TocSection'
        break
  }

  if node.children:
    node.children = node.children.map(tocTraverser)
  node
