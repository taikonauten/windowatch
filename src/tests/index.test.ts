import { expect } from 'chai';
import { windowatch } from '../index';

describe('Windowatch', () => {
  let sut: typeof windowatch;

  beforeEach(done => {
    sut = windowatch;
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
      const expectedViewportHeight = 1230;
      global.innerWidth = expectedViewportHeight;

      const actual = sut.getWindowWidth();

      expect(actual).to.equal(expectedViewportHeight);
      done();
    });
  });

  describe('#isSmallerThan', () => {
    it('should return true if given breakpoint is smaller than viewport breakpoint', done => {
      global.innerWidth = 320;

      const actual = sut.isSmallerThan('m');

      expect(actual).to.be.true;
      done();
    });
  });
});
