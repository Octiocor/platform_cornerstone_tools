## 🔔🔔🔔🔔 Attention: Cornerstone.js has evolved! We're excited to introduce [Cornerstone3D](https://github.com/cornerstonejs/cornerstone3D) 🚀. Expect advanced rendering, stellar performance, and a modern toolset. 🌐 Navigate to the new repository for the latest updates and improvements.

<div align="center">
<h1>cornerstone-tools</h1>

<p>A fork of cornerstone-tools maintained by Octiocor for use with the Octiocor Viewer platform. Provides a simple, extensible framework for creating tools on top of <a href="https://github.com/cornerstonejs/cornerstone/">Cornerstone.js</a>. Includes common tool implementations, and leverages DICOM metadata (when available) for advanced functionality.</p>

[**Read The Docs**](https://tools.cornerstonejs.org/) | [Edit the docs](https://github.com/cornerstonejs/cornerstoneTools/edit/master/docs/)

</div>

<hr />

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![Coverage Status][coverage-badge]][coverage]
[![All Contributors](https://img.shields.io/badge/all_contributors-37-orange.svg?style=flat-square)](#contributors)

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
<!-- prettier-ignore-end -->

## Index

### The Fun Stuff

- [TOOL EXAMPLES](https://tools.cornerstonejs.org/examples/)
  - [Create or Update an Example](https://github.com/cornerstonejs/cornerstoneTools/tree/master/examples)

### Everything Else

- [Installing](#installation)
- [Examples & Docs](#examples--docs)
- [Contributing][contributing]

## The problem

Building one or two tools on top of [Cornerstone.js](https://github.com/cornerstonejs/cornerstone/) is not that difficult. However, as the number of tools grow, you begin to encounter difficult problems:

- Tools should behave and be configurable in a consistant way
- Managing tools across multiple cornerstone `enabled element`s
- Tools that need knowledge of a fellow tool's state
- The ability to "drop-in" others' tools, and they "just work"
- and many others

This library solves these problems in a highly pluggable and extensible way.

## This solution

`cornerstone-tools` is a light-weight solution for building Tools on top of Cornerstone.js. It's only dependencies are libraries within the Cornerstone family. Instead of trying to "do everything" it aims to be extensible and pluggable to aid in the rapid development of new tools. Ideally, tools created using `cornerstone-tools` can be easily shared, allowing for the creation of a broader ecosystem.

## Example

Below is a simplified example of creating a tool by extending `cornerstone-tool`'s `BaseTool` class.

```javascript
import cornerstone from 'cornerstone-core';
import { BaseTool } from 'cornerstone-tools';
import basicLevelingStrategy from '...';

export default class WwwcTool extends BaseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'Wwwc',
      strategies: { basicLevelingStrategy },
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        orientation: 0,
      },
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);
  }

  mouseDragCallback(evt) {
    this.applyActiveStrategy(evt);

    cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }

  touchDragCallback(evt) {
    evt.stopImmediatePropagation();
    this.applyActiveStrategy(evt);

    cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }
}
```

## Installation

This package is distributed via GitHub Packages and should be installed as one of your project's `dependencies`:

```js
// Add to your .npmrc file:
@octiocor:registry=https://npm.pkg.github.com

// Then install:
npm install @octiocor/cornerstone-tools
```

This library has `peerDependencies` listings for:

- `hammerjs` - Better touch support
- `cornerstone-core`
- `cornerstone-math` - Simplifies and provides shared complex tool math logic
- Any Cornerstone "Image Loader"
  - `cornerstone-web-image-loader` - JPEG/PNG images
  - `cornerstone-wado-image-loader` - DICOM images; also parses tags for tool use

If you need to support the `IE11` Browser, you will need to provide polyfills as needed. Our BrowserList target:

```json
  "browserslist": [
    "> 1%",
    "IE 11",
    "not dead",
    "not IE < 11",
    "not op_mini all"
  ]
```

**Setting up and configuring `cornerstone-tools`'s depency can be the biggest hurdle to getting started. Be sure to check out our docs for assistance.**

> [**Docs**](https://tools.cornerstonejs.org/installation.html)

## Examples & Docs

> The latest major version has just been published. We are still flushing out our examples. If you have anything you would like to see documented, or you want a specific example from [version 2][version-2] ported, either create an issue or make a pull request ^\_^

- [Documentation](https://tools.cornerstonejs.org)
- [Examples](https://tools.cornerstonejs.org/examples)
- [API](https://tools.cornerstonejs.org/api)

### Tools

#### Annotation Tools

- [Angle](https://tools.cornerstonejs.org/examples/tools/angle.html)
- [Elliptical ROI](https://tools.cornerstonejs.org/examples/tools/elliptical-roi.html)
- [Length](https://tools.cornerstonejs.org/examples/tools/length.html)
- [Rectangle ROI](https://tools.cornerstonejs.org/examples/tools/rectangle-roi.html)

#### 3rd Party Tool Plugins

- Image Statistics: [Source](https://github.com/QSolutionsLLC/cornerstone-tool-image-statistics) | [Demo](https://qsolutionsllc.github.io/cornerstone-tool-image-statistics/)
- Rotated Elliptical ROI Tool: [Source](https://github.com/sisobus/cornerstoneTools-RotatedEllipticalRoiTool) | [Demo](https://examples.sisobus.com/rotated-elliptical-roi/)

A huge thanks to tool authors, like @sisobus, for sharing their work with the community!

## Other Solutions

- OHIF Viewer: [Source][ohif-source] | [Demo][ohif-demo]

## Contributors

This project is based on the work of many contributors to the original cornerstone-tools project. We maintain this fork for specific use with the Octiocor Viewer platform.

## Issues

_Looking to contribute? Look for the [Good First Issue][good-first-issue]
label._

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**][bugs]

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding
a 👍. This helps maintainers prioritize what to work on.

- [**See Feature Requests**][requests-feature]
- [**See Internal Change Requests**][requests-implementation]

### ❓ Questions

For questions related to using the library, please visit our support community,
or file an issue on GitHub.

- [Google Group][google-group]

## LICENSE

MIT

<!--
Links:
-->

<!-- prettier-ignore-start -->
[build-badge]: https://circleci.com/gh/cornerstonejs/cornerstoneTools/tree/master.svg?style=svg
[build]: https://circleci.com/gh/cornerstonejs/cornerstoneTools/tree/master
[contributing]: https://github.com/cornerstonejs/cornerstoneTools/blob/master/CONTRIBUTING.md
[coverage-badge]: https://codecov.io/gh/cornerstonejs/cornerstoneTools/branch/master/graphs/badge.svg
[coverage]: https://codecov.io/gh/cornerstonejs/cornerstoneTools/branch/master
[npm-url]: https://npmjs.org/package/cornerstone-tools
[npm-downloads-image]: http://img.shields.io/npm/dm/cornerstone-tools.svg?style=flat
[npm-version-image]: http://img.shields.io/npm/v/cornerstone-tools.svg?style=flat
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[version-2]: https://github.com/cornerstonejs/cornerstoneTools/tree/v2.4.x
[node]: https://nodejs.org
[ohif-demo]: https://viewer.ohif.org/demo-signin
[ohif-source]: https://github.com/OHIF/Viewers
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
[bugs]: https://github.com/cornerstonejs/cornerstoneTools/issues?q=is%3Aissue+is%3Aopen+label%3A"🐛+Bug%3A+Verified"+sort%3Acreated-desc
[requests-feature]: https://github.com/cornerstonejs/cornerstoneTools/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc+label%3A"💻+Change%3A+Feature"+is%3Aopen
[requests-implementation]: https://github.com/cornerstonejs/cornerstoneTools/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc+label%3A"💻+Change%3A+Implementation"+is%3Aopen
[good-first-issue]: https://github.com/cornerstonejs/cornerstoneTools/issues?utf8=✓&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3A"🥇+Good+First+Issue"
[google-group]: https://groups.google.com/forum/#!forum/cornerstone-platform
<!-- prettier-ignore-end -->
