
import './index.css';
import TaikoLibWindowatch from '../src/index';

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
  console.info(`scroll at breakpoint m: ${String(TaikoLibWindowatch.getBreakpoint() === 'm')}`);

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
  const currentBreakpoint = TaikoLibWindowatch.getBreakpoint();

  console.info(`TaikoLibWindowatch.getBreakpoint() (${currentBreakpoint as string}) === breakpoint (${breakpoint}): ${String(currentBreakpoint === breakpoint)}`);

  return () => console.info('render after breakpoint');
};

const breakpointListenerRemoved = (): () => void => {
  return () => console.info('breakpoint: this should never be shown');
};

if (setBreakpointSpecs) {
  TaikoLibWindowatch.setBreakpointSpecs(breakpointSpecs);
}

console.info(`TaikoLibWindowatch.getWindowWidth() === window.innerWidth: ${String(window.innerWidth === TaikoLibWindowatch.getWindowWidth())}`);

console.info(`TaikoLibWindowatch.getWindowHeight() === window.innerHeight: ${String(window.innerHeight === TaikoLibWindowatch.getWindowHeight())}`);

console.info(`TaikoLibWindowatch.getScrollY() === window.pageYOffset: ${String(window.pageYOffset === TaikoLibWindowatch.getScrollY())}`);

if (testScroll) {
  TaikoLibWindowatch.addScrollListener(scrollListener);
  TaikoLibWindowatch.addScrollListener(scrollListenerRemoved);
  TaikoLibWindowatch.removeScrollListener(scrollListenerRemoved);
}

if (testResize) {
  TaikoLibWindowatch.addResizeListener(resizeListener);
  TaikoLibWindowatch.addResizeListener(resizeListenerRemoved);
  TaikoLibWindowatch.removeResizeListener(resizeListenerRemoved);
}


if (testBreakpoints) {
  const currentBreakpoint = TaikoLibWindowatch.getBreakpoint();

  console.info(`current breakpoint: ${currentBreakpoint as string}`);

  console.info(`correct spec: ${String(JSON.stringify(TaikoLibWindowatch.getBreakpointSpec()) === JSON.stringify(breakpointSpecs[currentBreakpoint!]))}`);

  console.info(`current breakpoint ${currentBreakpoint as string} smaller than m: ${String(TaikoLibWindowatch.isSmallerThan('m'))}`);
  console.info(`current breakpoint ${currentBreakpoint as string} bigger than m: ${String(TaikoLibWindowatch.isBiggerThan('m'))}`);

  try {
    TaikoLibWindowatch.isSmallerThan('wrongId');
  } catch (error) {
    console.error('isSmallerThan: wrong id given', error);
  }

  try {
    TaikoLibWindowatch.isBiggerThan('wrongId');
  } catch (error) {
    console.error('isBiggerThan: wrong id given', error);
  }

  TaikoLibWindowatch.addBreakpointListener(breakpointListener);
  TaikoLibWindowatch.addBreakpointListener(breakpointListenerRemoved);
  TaikoLibWindowatch.removeBreakpointListener(breakpointListenerRemoved);

  if (testBreakpointScroll) {
    TaikoLibWindowatch.addScrollListener(scrollListenerAtM, ['m']);
  }
}
