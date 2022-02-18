// passive events support
// https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
let supportsPassiveEvents = false;

try {
  const options = {
    get passive(): boolean {
      return (supportsPassiveEvents = true);
    },
  };
  // have to set and remove a no-op listener instead of null
  // (which was used previously), because Edge v15 throws an error
  // when providing a null callback.
  // https://github.com/rafgraph/detect-passive-events/pull/3
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop = (): void => { };
  window.addEventListener('p', noop, options);
  window.removeEventListener('p', noop, false);
  // eslint-disable-next-line no-empty
} catch (e) { }

/**
 * Windowatch is a singleton class managing scroll, resize and breakpoint change
 * events globally. It uses passive resize & scroll event listeners and
 * `requestAnimationFrame` to optimize dom interactions (get, update).
 */
class TaikoLibWindowatch {
  /**
   * Window width
   *
   * @private
   * @type {number}
   * @memberof TaikoLibWindowatch
   */
  private width = window.innerWidth;

  /**
   * Window height
   *
   * @private
   * @type {number}
   * @memberof TaikoLibWindowatch
   */
  private height = window.innerHeight;

  /**
   * Flag to determine if resize listeners should be called
   *
   * @private
   * @type {boolean}
   * @memberof TaikoLibWindowatch
   */
  private sizeDidChange = false;

  /**
   * Flag to determine if there is a resize listener
   * attached to window or if the calculation
   * has to be made as needed
   *
   * @private
   * @type {boolean}
   * @memberof TaikoLibWindowatch
   */
  private resizeListening = false;

  /**
   * Holds the current breakpoint name
   *
   * @private
   * @type {(BreakpointName | undefined)}
   * @memberof TaikoLibWindowatch
   */
  private breakpoint: BreakpointName | undefined;

  /**
   * Holds the breakpoint settings
   *
   * @private
   * @type {(BreakpointSpecs | undefined)}
   * @memberof TaikoLibWindowatch
   */
  private breakpointSpecs: BreakpointSpecs | undefined;

  /**
   * Flag to determine if the breakpoint listeners should be triggered
   *
   * @private
   * @type {boolean}
   * @memberof TaikoLibWindowatch
   */
  private breakpointDidChange = false;

  /**
   * Holds the current scroll position of the document
   *
   * @private
   * @memberof TaikoLibWindowatch
   */
  private scrollY = 0;

  /**
   * Indicates if the scroll position did change
   * to handle related callbacks
   *
   * @private
   * @memberof TaikoLibWindowatch
   */
  private scrollDidChange = false;

  /**
   * Flag to determine if there is a scroll listener
   * attached to window or if related calculations
   * need to be made as soon as requested
   *
   * @private
   * @memberof TaikoLibWindowatch
   */
  private scrollListening = false;

  /**
   * Flag to prevent requesting animation frame
   * updates multiple times
   *
   * @private
   * @memberof TaikoLibWindowatch
   */
  private framePending = false;

  /**
   * Holds all registered functions which
   * have to be called on scroll events
   *
   * @private
   * @type {((scrollY: number) => CallableFunction)[]}
   * @memberof TaikoLibWindowatch
   */
  private scrollListeners: ((scrollY: number) => CallableFunction)[] = [];

  /**
    * Holds arrays of breakpoint names for each added scroll listener
    * to trigger callbacks only at certain breakpoints
    *
    * @private
    * @type {BreakpointName[][]}
    * @memberof TaikoLibWindowatch
    */
  private scrollListenerBreakpoints: BreakpointName[][] = [];

  /**
    * Holds all registered functions which
    * have to be called on window resize events
    *
    * @private
    * @type {((width: number, height: number) => CallableFunction)[]}
    * @memberof TaikoLibWindowatch
    */
  private resizeListeners: ((width: number, height: number) => CallableFunction)[] = [];

  /**
    * Holds all registered functions which
    * have to be called on breakpoint changes
    *
    * @private
    * @type {((breakpoint: BreakpointName, specs: BreakpointSpecs) => CallableFunction)[]}
    * @memberof TaikoLibWindowatch
    */
  private breakpointListeners: ((breakpoint: BreakpointName, specs: BreakpointSpec) => CallableFunction)[] = [];

  /**
   * Returns current window width.
   *
   * @return {number}
   * @memberof TaikoLibWindowatch
   */
  getWindowWidth(): number {
    // Calculate window measurements in case
    // there are no listeners set and the sizes
    // are not calculated or up to date
    if (!this.resizeListening) {
      this.windowDidResize();
    }

    return this.width;
  }

  /**
   * Returns current window height.
   *
   * @return {number}
   * @memberof TaikoLibWindowatch
   */
  getWindowHeight(): number {
    // Calculate window measurements in case
    // there are no listeners set and the sizes
    // are not calculated or up to date
    if (!this.resizeListening) {
      this.windowDidResize();
    }

    return this.height;
  }

  /**
   * Checks if the current screen size
   * is smaller than a given breakpoint
   *
   * @param {BreakpointName} breakpoint
   * @return {boolean}
   * @memberof TaikoLibWindowatch
   */
  isSmallerThan(breakpoint: BreakpointName): boolean {

    if (this.breakpointSpecs === undefined) {
      throw new Error('No breakpoint specs defined.');
    }

    if (this.breakpoint === undefined) {
      throw new Error(`No breakpoint defined for window width ${this.width}px`);
    }

    const breakpointSpec = this.breakpointSpecs[breakpoint];

    if (breakpointSpec === undefined) {
      throw new Error(`No breakpoint specs found for breakpoint ${breakpoint}`);
    }

    return breakpointSpec.min === null || this.width < breakpointSpec.min;
  }

  /**
   * Checks if the current screen size
   * is bigger than a given breakpoint
   *
   * @param {BreakpointName} breakpoint
   * @return {boolean}
   * @memberof TaikoLibWindowatch
   */
  isBiggerThan(breakpoint: BreakpointName): boolean {

    if (this.breakpointSpecs === undefined) {
      throw new Error('No breakpoint specs defined.');
    }

    if (this.breakpoint === undefined) {
      throw new Error(`No breakpoint defined for window width ${this.width}px`);
    }

    const breakpointSpec = this.breakpointSpecs[breakpoint];

    if (breakpointSpec === undefined) {
      throw new Error(`No breakpoint specs found for breakpoint ${breakpoint}`);
    }

    return breakpointSpec.max === null || this.width > breakpointSpec.max;
  }

  /**
   * Returns current breakpoint name.
   *
   * @return {BreakpointName | undefined}
   * @memberof TaikoLibWindowatch
   */
  getBreakpoint(): BreakpointName | undefined {

    if (this.breakpointSpecs === undefined) {
      throw new Error('No breakpoint specs defined.');
    }

    // Calculate window measurements in case
    // there are no listeners set and the sizes
    // are not calculated or up to date
    if (!this.resizeListening) {
      this.windowDidResize();
    }

    if (this.breakpoint === undefined) {
      throw new Error(`No breakpoint defined for window width ${this.width}px`);
    }

    return this.breakpoint;
  }

  /**
   * Returns current breakpoint spec.
   *
   * @return {BreakpointSpec | undefined}
   * @memberof TaikoLibWindowatch
   */
  getBreakpointSpec(): BreakpointSpec | undefined {

    if (this.breakpointSpecs === undefined) {
      throw new Error('No breakpoint specs defined.');
    }

    // Calculate window measurements in case
    // there are no listeners set and the sizes
    // are not calculated or up to date
    if (!this.resizeListening) {
      this.windowDidResize();
    }

    if (this.breakpoint === undefined) {
      throw new Error(`No breakpoint defined for window width ${this.width}px`);
    }

    return this.breakpointSpecs[this.breakpoint];
  }

  /**
   * Returns current window scrollY.
   *
   * @return {number}
   * @memberof TaikoLibWindowatch
   */
  getScrollY(): number {
    // Calculate scroll position in case
    // there are no listeners set and the position
    // is not calculated or up to date
    if (!this.scrollListening) {
      this.windowDidScroll();
    }

    return this.scrollY;
  }

  /**
   * Adds a scroll listener.
   *
   * @example
   * windowatch.addScrollListener((scroll, windowatch) => {
   *   let measurement = $element.classList.contains('block--foo');
   *   return () => {
   *     $element.classList.toggle('block--bar', measurement);
   *   }
   * });
   *
   * @param {function(scrollY: int): CallableFunction} callback
   * Function called when a scroll event gets fired. The function returned by
   * that callback gets called at the end of the frame. You should do your dom
   * measurements inside the callback and the dom updates inside the function
   * returned by the callback.
   * @param {?BreakpointName[]} [breakpoints] Array of breakpoint names in which this
   * listener should to get scroll events.
   * @return {TaikoLibWindowatch} Fluent interface
   * @memberof TaikoLibWindowatch
   */

  addScrollListener(callback: CallableFunction, breakpoints: BreakpointName[] = []): TaikoLibWindowatch {

    if (this.scrollListeners.indexOf(callback as never) === -1) {
      this.scrollListeners.push(callback as never);
      this.scrollListenerBreakpoints.push(breakpoints as never);
      this.updateWindowListeners();
    }

    return this;
  }

  /**
   * Removes scroll listener.
   *
   * @param {CallableFunction} callback
   * @return {TaikoLibWindowatch} Fluent interface
   * @memberof TaikoLibWindowatch
   */
  removeScrollListener(callback: CallableFunction): TaikoLibWindowatch {
    const index = this.scrollListeners.indexOf(callback as never);

    if (index !== -1) {
      this.scrollListeners.splice(index, 1);
      this.scrollListenerBreakpoints.splice(index, 1);
      this.updateWindowListeners();
    }

    return this;
  }

  /**
   * Adds resize listener.
   *
   * @param {function(width: int, height: int): CallableFunction} callback
   * @return {TaikoLibWindowatch} Fluent interface
   * @memberof TaikoLibWindowatch
   */
  addResizeListener(callback: CallableFunction): TaikoLibWindowatch {

    if (this.resizeListeners.indexOf(callback as never) === -1) {
      this.resizeListeners.push(callback as never);
      this.updateWindowListeners();
    }

    return this;
  }

  /**
   * Removes resize listener.
   *
   * @param {CallableFunction} callback
   * @return {TaikoLibWindowatch} Fluent interface
   * @memberof TaikoLibWindowatch
   */
  removeResizeListener(callback: CallableFunction): TaikoLibWindowatch {
    const index = this.resizeListeners.indexOf(callback as never);

    if (index !== -1) {
      this.resizeListeners.splice(index, 1);
      this.updateWindowListeners();
    }

    return this;
  }

  /**
   * Sets the breakpoint specs. Needs to be called before adding any breakpoint
   * listeners or getting the current breakpoint.
   *
   * @example
   * windowatch.setBreakpointSpecs({
   *   s: { min: 0, max: 1199 },
   *   l: { min: 1200, max: null }
   * });
   *
   * @param {BreakpointSpecs} breakpointMap Object mapping breakpoint names to their respective specs.
   * @return {TaikoLibWindowatch} Fluent interface
   * @memberof TaikoLibWindowatch
   */
  setBreakpointSpecs(breakpointSpecs: BreakpointSpecs): TaikoLibWindowatch {
    this.breakpointSpecs = breakpointSpecs;
    // handle possible changes due to now registered breakpoint specs
    this.windowDidResize();

    return this;
  }

  /**
   * Adds breakpoint listener.
   *
   * @param {function(breakpoint: BreakpointName, spec: BreakpointSpec): CallableFunction} callback
   * @return {TaikoLibWindowatch} Fluent interface
   * @memberof TaikoLibWindowatch
   */
  addBreakpointListener(callback: CallableFunction): TaikoLibWindowatch {

    if (this.breakpointListeners.indexOf(callback as never) === -1) {
      this.breakpointListeners.push(callback as never);
      this.updateWindowListeners();
    }

    return this;
  }

  /**
   * Removes breakpoint listener.
   *
   * @param {CallableFunction} callback
   * @return {TaikoLibWindowatch} Fluent interface
   * @memberof TaikoLibWindowatch
   */
  removeBreakpointListener(callback: CallableFunction): TaikoLibWindowatch {
    const index = this.breakpointListeners.indexOf(callback as never);

    if (index !== -1) {
      this.breakpointListeners.splice(index, 1);
      this.updateWindowListeners();
    }

    return this;
  }

  /**
   * Registers or deregisters window listeners, depending on own listener.
   *
   * @protected
   * @return {TaikoLibWindowatch} Fluent interface
   * @memberof TaikoLibWindowatch
   */
  protected updateWindowListeners(): void {
    // count total resize listeners (scroll listeners depend on resize)
    const listenerCount =
      this.scrollListeners.length +
      this.resizeListeners.length +
      this.breakpointListeners.length;

    // register resize listener if necessary
    if (!this.resizeListening && listenerCount > 0) {
      this.resizeListening = true;
      window.addEventListener('resize', this.windowDidResize, supportsPassiveEvents ? { passive: true } : false);
      this.windowDidResize();
    }

    // deregister resize listener if no longer needed
    if (this.resizeListening && listenerCount === 0) {
      window.removeEventListener('resize', this.windowDidResize);
      this.resizeListening = false;
    }

    // count scroll listeners for current breakpoint
    let scrollListenerCount = 0;

    this.scrollListeners.forEach((callback, index) => {
      const breakpoints = this.scrollListenerBreakpoints[index];

      if (breakpoints.length === 0 || breakpoints.indexOf(this.breakpoint as BreakpointName) !== -1) {
        scrollListenerCount++;
      }
    });

    // register scroll listener if necessary
    if (!this.scrollListening && scrollListenerCount > 0) {
      this.scrollListening = true;
      window.addEventListener('scroll', this.windowDidScroll, supportsPassiveEvents ? { passive: true } : false);
      this.windowDidScroll();
    }

    // deregister scroll listener if no longer needed
    if (this.scrollListening && scrollListenerCount === 0) {
      window.removeEventListener('scroll', this.windowDidScroll);
      this.scrollListening = false;
    }
  }

  /**
   * Triggered at each window resize event.
   *
   * @protected
   * @memberof TaikoLibWindowatch
   */
  protected windowDidResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (this.width !== width || this.height !== height) {
      this.sizeDidChange = true;
    }

    this.width = width;
    this.height = height;
    this.requestFrame();

    if (this.breakpointSpecs === undefined) {
      // no breakpoints specified, stop here
      return;
    }

    // choose breakpoint
    const breakpoint = Object.keys(this.breakpointSpecs).find((breakpointName) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const spec: BreakpointSpec = this.breakpointSpecs![breakpointName];

      return (spec.min === null || width >= spec.min) &&
        (spec.max === null || width <= spec.max);
    });

    if (breakpoint === undefined) {
      throw new Error(`No breakpoint defined for window width ${width}px`);
    }

    if (this.breakpoint === breakpoint) {
      // breakpoint did not change, stop here
      return;
    }

    this.breakpoint = breakpoint;
    this.breakpointDidChange = true;
    this.updateWindowListeners();
    this.requestFrame();
  };

  /**
   * Triggered at each window scroll event.
   *
   * @protected
   * @memberof TaikoLibWindowatch
   */
  protected windowDidScroll = (): void => {
    const scrollY = window.scrollY;

    if (this.scrollY === scrollY) {
      // nothing changed, nothing to do
      return;
    }

    this.scrollY = scrollY;
    this.scrollDidChange = true;
    this.requestFrame();
  };

  /**
   * Requests the next frame.
   *
   * @protected
   * @memberof TaikoLibWindowatch
   */
  protected requestFrame = (): TaikoLibWindowatch => {

    // check if frame has already been requested
    if (!this.framePending) {
      this.framePending = true;
      window.requestAnimationFrame(this.frame);
    }

    return this;
  };

  /**
   * Triggered at each frame.
   *
   * @protected
   * @memberof TaikoLibWindowatch
   */
  protected frame = (): void => {
    this.framePending = false;
    // size, breakpoint and scroll listeners may return update callbacks
    // which should be executed at the end of the frame
    // separating dom measuring from dom updating should optimize performance
    const updateCallbacks: CallableFunction[] = [];

    // notify listeners about size change
    if (this.sizeDidChange) {
      this.resizeListeners.forEach((callback) => updateCallbacks.push(callback(this.width, this.height)));
      this.sizeDidChange = false;
    }

    // notify listeners about breakpoint change
    if (this.breakpointDidChange && this.breakpoint !== undefined) {
      const spec = this.breakpointSpecs?.[this.breakpoint];

      this.breakpointListeners.forEach((callback) => this.breakpoint && spec && updateCallbacks.push(callback(this.breakpoint, spec)));
      this.breakpointDidChange = false;
    }

    // notify listeners about scroll change
    if (this.scrollDidChange) {
      this.scrollListeners.forEach((callback, index) => {
        const breakpoints = this.scrollListenerBreakpoints[index];

        // only notify listeners who are interested
        // in scroll events in current breakpoint
        if (breakpoints.length === 0 || breakpoints.indexOf(this.breakpoint as BreakpointName) !== -1) {
          updateCallbacks.push(callback(this.scrollY));
        }
      });

      this.scrollDidChange = false;
    }

    // filter update callbacks and trigger them at the end of the frame
    updateCallbacks
      .filter(result => typeof result === 'function')
      .forEach((callback) => { callback(); });
  };
}

export const windowatch = new TaikoLibWindowatch();
