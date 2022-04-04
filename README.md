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
import Windowatch from '@taikonauten/windowatch';

// get the current window width
let width = Windowatch.getWindowWidth();
// -> 2560

// get the current window height
let height = Windowatch.getWindowHeight();
// -> 1440

// get the current vertical window scroll position
let scrollY = Windowatch.getScrollY();
// -> 42
```

### Work with breakpoints

Add breakpoint specification to your script's entry point:

```javascript
import Windowatch from '@taikonauten/windowatch';

Windowatch.setBreakpointSpecs({
  s: { min: null, max: 899 },
  m: { min: 900, max: 1199 },
  l: { min: 1200, max: null }
});
```

ℹ️ You can enhance the specifications of each breakpoint with your own information.

You can then receive information about the current breakpoint and its specs.

```javascript
// get the current breakpoint name
Windowatch.getBreakpoint();
// -> 's'

// get the current breakpoint specifications
Windowatch.getBreakpointSpec();
// -> { min: null, max: 899 }
```

Or you can check if the current breakpoint is smaller or larger than another one.
Both methods are called with a breakpoint name.

```javascript
// check if the current breakpoint is smaller than the given one
Windowatch.isSmallerThan('m');
// if current breakpoint is s -> true

// check if the current breakpoint is larger than the given one
Windowatch.isBiggerThan('m');
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
import Windowatch from '@taikonauten/windowatch';

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

Windowatch.addScrollListener(scrollHandler);
```

#### Scroll event

You can add and remove scroll listeners which are called after the scroll position of the document has changed.
The callback function accepts a single parameter, representing the current vertical scroll position.

```javascript
const scrollHandler = (scrollY) => {};

Windowatch.addScrollListener(scrollHandler);
Windowatch.removeScrollListener(scrollHandler);
```

You can call `addScrollListener` with a second parameter, if your callback should only be called at specific breakpoints.

ℹ️ You need to specify breakpoints first to use this feature.

```javascript
// The scrollHandler function is only called,
// if the current breakpoint has the name 'm' or 'l'
Windowatch.addScrollListener(scrollHandler, ['m', 'l']);
```

#### Resize event

You can add a callback function which is triggered after the size of the document has changed.
This callback receives the width and the height of the window as its parameter.

```javascript
const resizeHandler = (width, height) => {};

Windowatch.addResizeListener(resizeHandler);
Windowatch.removeResizeListener(resizeHandler);
```

#### Breakpoint event

If you do not need to react to each and every resize event but only if the current breakpoint has changed, you can register a breakpoint listener. The callback function is called with the new breakpoint and its related specifications as its parameters.

ℹ️ You need to specify breakpoints first to use this feature.

```javascript
const breakpointChangeHandler = (breakpoint, spec) => {};

Windowatch.addBreakpointListener(breakpointChangeHandler);
Windowatch.removeBreakpointListener(breakpointChangeHandler);
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
-import {windowatch as TaikoLibWindowatch} from '@libs/taiko-lib-windowatch';
+import TaikoLibWindowatch from '@taikonauten/windowatch';
```

### Changes in 2.1

Update the main import

```diff
-import TaikoLibWindowatch from '@taikonauten/windowatch';
+import Windowatch from '@taikonauten/windowatch';
```

---

Made with ♡ at Taikonauten
