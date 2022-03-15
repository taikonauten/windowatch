<p align="center">
  <img src="https://i.imgur.com/dV1aZjJ.png" title="Taikonauten">
</p>

<h1 align="center">Taikonauten windowatch</h1>

Windowatch is a singleton class managing scroll-, resize- and breakpoint-change events globally. It uses passive resize & scroll event listeners and `requestAnimationFrame` to optimize dom interactions (get, update). It removes unnecessary window event listeners automatically, if no listeners are attached.

## Installation

```shell
npm install --save @taikonauten/windowatch
```

## Usage

### Retrieve env properties

```javascript
import TaikoLibWindowatch from '@libs/taiko-lib-windowatch';

// get the current window width
let width = TaikoLibWindowatch.getWindowWidth();
// -> 2560

// get the current window height
let height = TaikoLibWindowatch.getWindowHeight();
// -> 1440

// get the current vertical window scroll position
let scrollY = TaikoLibWindowatch.getScrollY();
// -> 42
```

### Work with breakpoints

Add breakpoint specification to your script's entry point:

```javascript
import TaikoLibWindowatch from '@libs/taiko-lib-windowatch';

TaikoLibWindowatch.setBreakpointSpecs({
  s: { min: null, max: 899 },
  m: { min: 900, max: 1199 },
  l: { min: 1200, max: null }
});
```

ℹ️ You can enhance the specifications of each breakpoint with your own information.

You can then receive information about the current breakpoint and its specs.

```javascript
// get the current breakpoint name
TaikoLibWindowatch.getBreakpoint();
// -> 's'

// get the current breakpoint specifications
TaikoLibWindowatch.getBreakpointSpec();
// -> { min: null, max: 899 }
```

Or you can check if the current breakpoint is smaller or larger than another one.
Both methods are called with a breakpoint name.

```javascript
// check if the current breakpoint is smaller than the given one
TaikoLibWindowatch.isSmallerThan('m');
// if current breakpoint is s -> true

// check if the current breakpoint is larger than the given one
TaikoLibWindowatch.isBiggerThan('m');
// if current breakpoint is s -> false
```

### Working with events

You can add 3 types of event listeners:

* scroll listener
* resize listener
* breakpoint listener

Each callback can return another function which is called at the end of a frame.
Do all measurements and calculations first and put modifications like adding or removing classes in the `listener` callback.

Scroll listener example:

```javascript
import TaikoLibWindowatch from '@libs/taiko-lib-windowatch';

const scrollHandler = (scrollY) => {
  // dom measurements
  let measurement = $element.classList.contains('block--foo');

  // return update callback (optional)
  // gets called at the end of the frame
  return () => {
    // dom updates
    $element.classList.toggle('block--bar', measurement);
  }
}

TaikoLibWindowatch.addScrollListener(scrollHandler);
```

#### Scroll event

You can add and remove scroll listeners which are called after the scroll position of the document has changed.
The callback function accepts a single parameter, representing the current vertical scroll position.

```javascript
const scrollHandler = (scrollY) => {};

TaikoLibWindowatch.addScrollListener(scrollHandler);
TaikoLibWindowatch.removeScrollListener(scrollHandler);
```

You can call `addScrollListener` with a second parameter, if your callback should only be called at specific breakpoints.

ℹ️ You need to specify breakpoints first to use this feature.

```javascript
// The scrollHandler function is only called,
// if the current breakpoint has the name 'm' or 'l'
TaikoLibWindowatch.addScrollListener(scrollHandler, ['m', 'l']);
```

#### Resize event

You can add a callback function which is triggered after the size of the document has changed.
This callback receives the width and the height of the window as its parameter.

```javascript
const resizeHandler = (width, height) => {};

TaikoLibWindowatch.addResizeListener(resizeHandler);
TaikoLibWindowatch.removeResizeListener(resizeHandler);
```

#### Breakpoint event

If you do not need to react to each and every resize event but only if the current breakpoint has changed, you can register a breakpoint listener. The callback function is called with the new breakpoint and its related specifications as its parameters.

ℹ️ You need to specify breakpoints first to use this feature.

```javascript
const breakpointChangeHandler = (breakpoint, spec) => {};

TaikoLibWindowatch.addBreakpointListener(breakpointChangeHandler);
TaikoLibWindowatch.removeBreakpointListener(breakpointChangeHandler);
```

## Development & Playground

```shell
npm start
```

## Tests

Running the tests requires Chrome or Brave to be installed on in local environment.

To execute all tests, run the following command:

```shell
npm run test
```

In case you are getting an error regarding the missing `CHROME_BIN` environment variable, please follow this guide:

* locate Chrome or Brave binary by running `ls /usr/bin | grep 'chrome\|brave'`
* update the `CHROME_BIN` env variable by running `export CHROME_BIN=/usr/bin/brave-browser`

## Migration

### Changes in 2.x

Update the main import

```diff
-import {windowatch as TaikoLibWindowatch} from '../src/index';
+import TaikoLibWindowatch from '../src/index';
```

---

Made with ♡ at Taikonauten
