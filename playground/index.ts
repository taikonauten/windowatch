
import './index.css';
import Windowatch from '../src/index';

const testScroll = false;
const testResize = false;
const setBreakpointSpecs = true;
const testBreakpoints = true;
const testBreakpointScroll = true;

const breakpointSpecs: BreakpointSpecs = {
  s: {
    min: 0,
    max: 599,
    test: 'extend breakpoint s information'
  },
  m: {
    min: 600,
    max: 999,
    test: 'extend breakpoint m information'
  },
  l: {
    min: 1000,
    max: null,
    test: 'extend breakpoint l information'
  }
};

const scrollListener = (scrollY: number): () => void => {
  console.info(`scrollY === window.pageYOffset: ${String(window.pageYOffset === scrollY)}`);

  return () => console.info('render after scroll change');
};

const scrollListenerRemoved = (): () => void => {
  return () => console.info('scroll: this should never be shown');
};

const scrollListenerAtM = (scrollY: number): () => void => {
  console.info(`scrollY === window.pageYOffset: ${String(window.pageYOffset === scrollY)}`);
  console.info(`scroll at breakpoint m: ${String(Windowatch.getBreakpoint() === 'm')}`);

  return () => console.info('render after scroll change at breakpoint m');
};

const resizeListener = (width: number, height: number): () => void => {
  console.info(`width === window.innerWidth: ${String(window.innerWidth === width)}`);
  console.info(`height === window.innerHeight: ${String(window.innerHeight === height)}`);

  return () => console.info('render after resize');
};

const resizeListenerRemoved = (): () => void => {
  return () => console.info('resize: this should never be shown');
};

const breakpointListener = (breakpoint: BreakpointName): () => void => {
  const currentBreakpoint = Windowatch.getBreakpoint();

  console.info(`TaikoLibWindowatch.getBreakpoint() (${currentBreakpoint as string}) === breakpoint (${breakpoint}): ${String(currentBreakpoint === breakpoint)}`);

  return () => console.info('render after breakpoint');
};

const breakpointListenerRemoved = (): () => void => {
  return () => console.info('breakpoint: this should never be shown');
};

if (setBreakpointSpecs) {
  Windowatch.setBreakpointSpecs(breakpointSpecs);
}

console.info(`TaikoLibWindowatch.getWindowWidth() === window.innerWidth: ${String(window.innerWidth === Windowatch.getWindowWidth())}`);

console.info(`TaikoLibWindowatch.getWindowHeight() === window.innerHeight: ${String(window.innerHeight === Windowatch.getWindowHeight())}`);

console.info(`TaikoLibWindowatch.getScrollY() === window.pageYOffset: ${String(window.pageYOffset === Windowatch.getScrollY())}`);

if (testScroll) {
  Windowatch.addScrollListener(scrollListener);
  Windowatch.addScrollListener(scrollListenerRemoved);
  Windowatch.removeScrollListener(scrollListenerRemoved);
}

if (testResize) {
  Windowatch.addResizeListener(resizeListener);
  Windowatch.addResizeListener(resizeListenerRemoved);
  Windowatch.removeResizeListener(resizeListenerRemoved);
}


if (testBreakpoints) {
  const currentBreakpoint = Windowatch.getBreakpoint();

  console.info(`current breakpoint: ${currentBreakpoint as string}`);

  console.info(`correct spec: ${String(JSON.stringify(Windowatch.getBreakpointSpec()) === JSON.stringify(breakpointSpecs[currentBreakpoint!]))}`);

  console.info(`current breakpoint ${currentBreakpoint as string} smaller than m: ${String(Windowatch.isSmallerThan('m'))}`);
  console.info(`current breakpoint ${currentBreakpoint as string} bigger than m: ${String(Windowatch.isBiggerThan('m'))}`);

  try {
    Windowatch.isSmallerThan('wrongId');
  } catch (error) {
    console.error('isSmallerThan: wrong id given', error);
  }

  try {
    Windowatch.isBiggerThan('wrongId');
  } catch (error) {
    console.error('isBiggerThan: wrong id given', error);
  }

  Windowatch.addBreakpointListener(breakpointListener);
  Windowatch.addBreakpointListener(breakpointListenerRemoved);
  Windowatch.removeBreakpointListener(breakpointListenerRemoved);

  if (testBreakpointScroll) {
    Windowatch.addScrollListener(scrollListenerAtM, ['m']);
  }
}
