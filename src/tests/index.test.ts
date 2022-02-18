import chai, { expect } from 'chai';
import spies from 'chai-spies';
import { Windowatch } from '../';

// enable chai-spies plugin
chai.use(spies);
let sut: InstanceType<typeof Windowatch>;

describe('Windowatch', () => {
  beforeEach(done => {
    sut = new Windowatch();
    done();
  });

  describe('environment properties', () => {
    it('should return the current viewport width', done => {
      const expectedViewportWidth = 1230;
      global.innerWidth = expectedViewportWidth;

      const actual = sut.getWindowWidth();

      expect(actual).to.equal(expectedViewportWidth);
      done();
    });

    it('should return the current viewport height', done => {
      const expectedViewportHeight = 600;
      global.innerHeight = expectedViewportHeight;

      const actual = sut.getWindowHeight();

      expect(actual).to.equal(expectedViewportHeight);
      done();
    });
  });

  describe('#isSmallerThan', () => {
    it('should fail if no breakpoint specs are defined', done => {      
      expect(() => {sut.isSmallerThan('m');}).to.throw('No breakpoint specs defined.');
      done();
    });

    xit('should fail if viewport width does not match breakpoint specs', done => {
      window.innerWidth = 600; // initially set viewport to match breakpoint spec
      sut.setBreakpointSpecs({'x': {min: 400, max: 1000}});

      window.innerWidth = 1200; // now resize viewport to width outside of defined specs
      window.dispatchEvent(new Event('resize'));

      expect(() => {sut.isSmallerThan('x');}).to.throw('No breakpoint defined for window width 1200px');
      done();
    });

    it('should return true if viewport width is smaller than given breakpoint', done => {
      window.innerWidth = 600;
      sut.setBreakpointSpecs({'s': {min: 400, max: 999}, 'l': {min: 1000, max: 1200}});

      const actual = sut.isSmallerThan('l');

      expect(actual).to.be.true;
      done();
    });

    it('should return false if viewport width is larger than given breakpoint', done => {
      window.innerWidth = 1100;
      sut.setBreakpointSpecs({'s': {min: 400, max: 999}, 'l': {min: 1000, max: 1200}});

      const actual = sut.isSmallerThan('l');

      expect(actual).to.be.false;
      done();
    });

    it('should fail if given breakpoint does not match breakpoint specs', done => {
      window.innerWidth = 600; // initially set viewport to match breakpoint spec
      sut.setBreakpointSpecs({'x': {min: 400, max: 1000}});

      expect(() => {sut.isSmallerThan('z');}).to.throw('No breakpoint specs found for breakpoint z');
      done();
    });

    /**
     * TODO: this is a potential bug, as any breakpoint spec with {min: null, ...} will return true
     */
    it('should return true if breakpoint spec [min] value is null', done => {
      window.innerWidth = 1200;
      sut.setBreakpointSpecs({'s': {min: null, max: 999}, 'l': {min: null, max: 1200}});

      const actual = sut.isSmallerThan('l');

      expect(actual).to.be.true;
      done();
    });
  });

  describe('#isBiggerThan', () => {
    it('should fail if no breakpoint specs are defined', done => {      
      expect(() => {sut.isSmallerThan('m');}).to.throw('No breakpoint specs defined.');
      done();
    });

    xit('should fail if viewport width does not match breakpoint specs', done => {
      window.innerWidth = 600; // initially set viewport to match breakpoint spec
      sut.setBreakpointSpecs({'x': {min: 400, max: 1000}});

      window.innerWidth = 1200; // now resize viewport to width outside of defined specs
      window.dispatchEvent(new Event('resize'));

      expect(() => {sut.isBiggerThan('x');}).to.throw('No breakpoint defined for window width 1200px');
      done();
    });

    it('should return true if viewport width is bigger than given breakpoint', done => {
      window.innerWidth = 1100;
      sut.setBreakpointSpecs({'s': {min: 400, max: 999}, 'l': {min: 1000, max: 1200}});

      const actual = sut.isBiggerThan('s');

      expect(actual).to.be.true;
      done();
    });

    it('should return false if viewport width is smaller than given breakpoint', done => {
      window.innerWidth = 600;
      sut.setBreakpointSpecs({'s': {min: 400, max: 999}, 'l': {min: 1000, max: 1200}});

      const actual = sut.isBiggerThan('s');

      expect(actual).to.be.false;
      done();
    });

    it('should fail if given breakpoint does not match breakpoint specs', done => {
      window.innerWidth = 600; // initially set viewport to match breakpoint spec
      sut.setBreakpointSpecs({'x': {min: 400, max: 1000}});

      expect(() => {sut.isBiggerThan('z');}).to.throw('No breakpoint specs found for breakpoint z');
      done();
    });

    /**
     * TODO: this is a potential bug, as any breakpoint spec with {max: null, ...} will return true
     */
    it('should return true if breakpoint spec [max] value is null', done => {
      window.innerWidth = 600;
      sut.setBreakpointSpecs({'s': {min: null, max: 999}, 'l': {min: 1000, max: null}});

      const actual = sut.isBiggerThan('l');

      expect(actual).to.be.true;
      done();
    });
  });

  describe('#getBreakpoint', () => {
    beforeEach(done => {
      global.innerWidth = 600;
      done();
    });

    it('should fail if no breakpoint specs are defined', done => {
      expect(() => {sut.getBreakpoint();}).to.throw('No breakpoint specs defined.');
      
      done();
    });

    it('should invoke #windowDidResize if no resize listener exist', done => {
      sut.setBreakpointSpecs({x: {min: null, max: 600}});

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'windowDidResize');

      // invoke actual function call
      sut.getBreakpoint();

      // define expectation for spied function
      expect(spy).to.have.been.called.once;

      done();
    });

    it('should not invoke #windowDidResize if resize listener exist', done => {
      sut.setBreakpointSpecs({x: {min: null, max: 600}});
      sut.addResizeListener(() => {return;});
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'windowDidResize');

      // invoke actual function call
      sut.getBreakpoint();
      
      // define expectation for spied function
      expect(spy).to.have.been.called.exactly(0);

      done();
    });

    it('should fail if no breakpoint is defined for current viewport width', done => {
      sut.setBreakpointSpecs({x: {min: null, max: 600}});
      // set viewport width to be greater than defined specs
      global.innerWidth = 800;

      expect(() => {sut.getBreakpoint();}).to.throw('No breakpoint defined for window width 800px');
      
      done();
    });

    it('should return the current breakpoint', done => {
      sut.setBreakpointSpecs({x: {min: null, max: 600}});

      const actual = sut.getBreakpoint();

      expect(actual).to.be.equal('x');
      
      done();
    });
  });

  describe('#getBreakpointSpec', () => {
    beforeEach(done => {
      global.innerWidth = 600;
      done();
    });

    it('should fail if no breakpoint specs are defined', done => {
      expect(() => {sut.getBreakpointSpec();}).to.throw('No breakpoint specs defined.');
      
      done();
    });

    it('should invoke #windowDidResize if no resize listener exist', done => {
      sut.setBreakpointSpecs({x: {min: null, max: 600}});

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'windowDidResize');

      // invoke actual function call
      sut.getBreakpointSpec();

      // define expectation for spied function
      expect(spy).to.have.been.called.once;

      done();
    });

    it('should not invoke #windowDidResize if resize listener exist', done => {
      sut.setBreakpointSpecs({x: {min: null, max: 600}});
      sut.addResizeListener(() => {return;});
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'windowDidResize');

      // invoke actual function call
      sut.getBreakpointSpec();
      
      // define expectation for spied function
      expect(spy).to.have.been.called.exactly(0);

      done();
    });

    it('should fail if no breakpoint is defined for current viewport width', done => {
      sut.setBreakpointSpecs({x: {min: null, max: 600}});
      // set viewport width to be greater than defined specs
      global.innerWidth = 800;

      expect(() => {sut.getBreakpointSpec();}).to.throw('No breakpoint defined for window width 800px');
      
      done();
    });

    it('should return the current breakpoint spec', done => {
      const expectedSpecs = {x: {min: null, max: 600}};
      sut.setBreakpointSpecs(expectedSpecs);

      const actual = sut.getBreakpointSpec();

      expect(actual).to.be.equal(expectedSpecs.x);
      
      done();
    });
  });

  describe('#getScrollY', () => {
    beforeEach(done => {
      global.innerWidth = 600;
      global.innerHeight = 2000;
      done();
    });

    it('should invoke #windowDidScroll if no scroll listener exist', done => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'windowDidScroll');

      // invoke actual function call
      sut.getScrollY();

      // define expectation for spied function
      expect(spy).to.have.been.called.once;

      done();
    });

    it('should not invoke #windowDidScroll if scroll listener exist', done => {
      sut.addScrollListener(() => {return;});

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'windowDidScroll');

      // invoke actual function call
      sut.getScrollY();

      // define expectation for spied function
      expect(spy).to.have.been.called.exactly(0);

      done();
    });

    it('should return the current scroll y position', done => {
      const expectedScrollY = 800;
      global.pageYOffset = expectedScrollY;

      const actual = sut.getScrollY();

      expect(actual).to.be.equal(expectedScrollY);

      done();
    });
  });

  describe('#addScrollListener', () => {
    it('creates a new scroll listener and calls #updateWindowListeners once', done => {
      const scrollListener = (): void => {
        return;
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');

      sut.addScrollListener(scrollListener);

      expect(spy).to.have.been.called.once;

      done();
    });

    it('does not create new scroll listener if callback already exists and calls #updateWindowListeners once', done => {
      const scrollListener = (): void => {
        return;
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');
      
      // add first scroll listener
      sut.addScrollListener(scrollListener);
      // add second scroll listener with same callback
      sut.addScrollListener(scrollListener);

      expect(spy).to.have.been.called.once;
      
      done();
    });
  });

  describe('#removeScrollListener', () => {
    it('removes existing scroll listener and calls #updateWindowListeners once', done => {
      const scrollListener = (): void => {
        return;
      };

      // add scroll listener
      sut.addScrollListener(scrollListener);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');

      sut.removeScrollListener(scrollListener);

      expect(spy).to.have.been.called.once;

      done();
    });

    it('does not remove non existing scroll listener and does not calls #updateWindowListeners', done => {
      const scrollListener = (): void => {
        return;
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');

      sut.removeScrollListener(scrollListener);

      expect(spy).to.have.been.called.exactly(0);

      done();
    });
  });

  describe('#addResizeListener', () => {
    it('creates a new resize listener and calls #updateWindowListeners once', done => {
      const resizeListener = (): void => {
        return;
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');

      sut.addResizeListener(resizeListener);

      expect(spy).to.have.been.called.once;

      done();
    });

    it('does not create new resize listener if callback already exists and calls #updateWindowListeners once', done => {
      const resizeListener = (): void => {
        return;
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');
      
      // add first resize listener
      sut.addResizeListener(resizeListener);
      // add second resize listener with same callback
      sut.addResizeListener(resizeListener);

      expect(spy).to.have.been.called.once;
      
      done();
    });
  });

  describe('#removeResizeListener', () => {
    it('removes existing resize listener and calls #updateWindowListeners once', done => {
      const resizeListener = (): void => {
        return;
      };

      // add resize listener
      sut.addResizeListener(resizeListener);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');

      sut.removeResizeListener(resizeListener);

      expect(spy).to.have.been.called.once;

      done();
    });

    it('does not remove non existing resize listener and does not call #updateWindowListeners', done => {
      const resizeListener = (): void => {
        return;
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');

      sut.removeResizeListener(resizeListener);

      expect(spy).to.have.been.called.exactly(0);

      done();
    });
  });

  describe('#setBreakpointSpecs', () => {
    it('should call #windowDidResize once', done => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'windowDidResize');
      
      sut.setBreakpointSpecs({x: {min: 600, max: 1000}});

      expect(spy).to.have.been.called.once;
      
      done();
    });
  });

  describe('#addBreakpointListener', () => {
    it('creates a new breakpoint listener and calls #updateWindowListeners once', done => {
      const resizeListener = (): void => {
        return;
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');

      sut.addBreakpointListener(resizeListener);

      expect(spy).to.have.been.called.once;

      done();
    });

    it('does not create new breakpoint listener if callback already exists and calls #updateWindowListeners once', done => {
      const breakpointListener = (): void => {
        return;
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');
      
      // add first breakpoint listener
      sut.addBreakpointListener(breakpointListener);
      // add second breakpoint listener with same callback
      sut.addBreakpointListener(breakpointListener);

      expect(spy).to.have.been.called.once;
      
      done();
    });
  });

  describe('#removeBreakpointListener', () => {
    it('removes existing breakpoint listener and calls #updateWindowListeners once', done => {
      const breakpointListener = (): void => {
        return;
      };

      // add breakpoint listener
      sut.addBreakpointListener(breakpointListener);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');

      sut.removeBreakpointListener(breakpointListener);

      expect(spy).to.have.been.called.once;

      done();
    });

    it('does not remove non existing breakpoint listener and does not call #updateWindowListeners', done => {
      const breakpointListener = (): void => {
        return;
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = chai.spy.on(sut, 'updateWindowListeners');

      sut.removeBreakpointListener(breakpointListener);

      expect(spy).to.have.been.called.exactly(0);

      done();
    });
  });
});
