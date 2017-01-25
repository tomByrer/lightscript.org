import last from 'lodash/last'

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


export default mainDocsTraverser(node) ->
  // console.log(node)

  switch node.tagName {
    case 'h2':
    case 'h3':
      node.children.unshift(makeHeadingAnchor(node.properties.id))
      break

    case 'pre':
      textNodes := node.children.0.children
      // replace, don't recurse
      return makeCodeRow(textNodes)

    case 'div':
      node.children = wrapIntoSectionsByH2(node.children)
      break
  }

  if node.children:
    node.children = node.children.map(mainDocsTraverser)

  return node


wrapIntoSectionsByH2(children) ->
  sections := []
  for child of children:
    if child.tagName == 'h2':
      id := `section-${child.properties.id}`
      newSection := makeSection(id, [child])
      sections.push(newSection)
    elif child.value == '\n':
      continue
    else:
      if sections.length < 1: sections.push(makeSection('first', []))
      currentSection := sections~last()
      currentSection.children.push(child)

  sections

makeSection(id, children) ->
  {
    type: 'element'
    tagName: 'section'
    properties: { id }
    children
  }

makeHeadingAnchor(id) ->
  {
    type: 'element'
    tagName: 'a'
    properties: { href: `#${id}`, class: 'heading-anchor' }
    children: [{
      type: 'element'
      tagName: 'svg'
      properties: {
        ariaHidden: true
        height: '16'
        version: '1.1'
        width: '16'
      }
      children: [{
        type: 'element'
        tagName: 'path'
        properties: {
          fill: '#666666'
          d: 'M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z'
        }
      }]
    }]
  }

makeCodeRow(textNodes) ->
  lsc := textNodes.map(n -> n.value).join('')

  let js
  try:
    js = transform(lsc, { plugins: [lightscript] }).code
  catch (err):
    js = "Not yet implemented.\n\n" + err.message

  {
    type: 'element'
    tagName: 'div'
    properties: { class: 'row' }
    children: [makeCodeCol(lsc), makeCodeCol(js)]
  }

makeCodeCol(code) ->
  {
    type: 'element'
    tagName: 'div'
    properties: { class: 'col-sm-6' }
    children: [{
      type: 'element'
      tagName: 'pre'
      properties: { class: 'h-100' }
      children: [{
        type: 'element'
        tagName: 'code'
        children: [{
          type: 'text'
          value: code
        }]
      }]
    }]
  }
