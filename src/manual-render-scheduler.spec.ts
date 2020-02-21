import { ManualRenderScheduler, newManualRenderScheduler } from './manual-render-scheduler';
import { RenderSchedule } from './render-schedule';

describe('manualRenderScheduler', () => {

  let scheduler: ManualRenderScheduler;
  let schedule: RenderSchedule;
  let schedule2: RenderSchedule;

  beforeEach(() => {
    scheduler = newManualRenderScheduler();
    schedule = scheduler();
    schedule2 = scheduler();
  });

  describe('render', () => {
    it('returns `false` when no renders scheduled', () => {
      expect(scheduler.render()).toBe(false);
    });
    it('executes scheduled renders by request', () => {

      const render1 = jest.fn();
      const render2 = jest.fn();
      const render3 = jest.fn();

      schedule(render1);
      schedule2(render2);
      schedule2(render3);

      expect(render1).not.toHaveBeenCalled();
      expect(render2).not.toHaveBeenCalled();
      expect(render3).not.toHaveBeenCalled();

      expect(scheduler.render()).toBe(true);
      expect(render1).toHaveBeenCalled();
      expect(render2).not.toHaveBeenCalled();
      expect(render3).toHaveBeenCalled();

      expect(scheduler.render()).toBe(false);
      expect(render1).toHaveBeenCalledTimes(1);
      expect(render2).not.toHaveBeenCalled();
      expect(render3).toHaveBeenCalledTimes(1);
    });
    it('executes postponed renders', () => {

      const postponed1 = jest.fn();
      const postponed2 = jest.fn();

      schedule(exec => {
        exec.postpone(postponed1);
        exec.postpone(postponed2);
      });

      expect(postponed1).not.toHaveBeenCalled();
      expect(postponed2).not.toHaveBeenCalled();

      scheduler.render();
      expect(postponed1).toHaveBeenCalledTimes(1);
      expect(postponed2).toHaveBeenCalledTimes(1);
    });
    it('executes recurrent renders by next request', () => {

      const render1 = jest.fn();
      const render2 = jest.fn();
      const render3 = jest.fn();
      const render4 = jest.fn();

      schedule(render1.mockImplementation(() => {
        schedule2(render2);
        schedule(render3);
        schedule(render4);
      }));

      expect(render1).not.toHaveBeenCalled();
      expect(render2).not.toHaveBeenCalled();
      expect(render3).not.toHaveBeenCalled();
      expect(render4).not.toHaveBeenCalled();

      expect(scheduler.render()).toBe(true);
      expect(render1).toHaveBeenCalled();
      expect(render2).not.toHaveBeenCalled();
      expect(render3).not.toHaveBeenCalled();
      expect(render4).not.toHaveBeenCalled();

      expect(scheduler.render()).toBe(true);
      expect(render2).toHaveBeenCalled();
      expect(render3).not.toHaveBeenCalled();
      expect(render4).toHaveBeenCalled();

      expect(scheduler.render()).toBe(false);
      expect(render1).toHaveBeenCalledTimes(1);
      expect(render2).toHaveBeenCalledTimes(1);
      expect(render3).not.toHaveBeenCalled();
      expect(render4).toHaveBeenCalledTimes(1);
    });
  });
  it('logs errors according to schedule options', () => {

    const logError1 = jest.fn();
    const logError2 = jest.fn();

    schedule = scheduler({ error: logError1 });
    schedule2 = scheduler({ error: logError2 });

    const error = new Error('!');

    schedule(() => { throw error; });
    schedule2(() => { throw error; });

    scheduler.render();
    expect(logError1).toHaveBeenCalledWith(error);
    expect(logError1).toHaveBeenCalledTimes(1);
    expect(logError2).toHaveBeenCalledWith(error);
    expect(logError2).toHaveBeenCalledTimes(1);
  });
  it('calls renders with their schedule configs', () => {

    const options1 = { node: document.createElement('div') };
    const options2 = { node: document.createElement('span') };

    schedule = scheduler(options1);
    schedule2 = scheduler(options2);

    const render1 = jest.fn();
    const render2 = jest.fn();

    schedule(render1);
    schedule2(render2);

    scheduler.render();
    expect(render1).toHaveBeenCalledWith(expect.objectContaining({ config: expect.objectContaining(options1) }));
    expect(render2).toHaveBeenCalledWith(expect.objectContaining({ config: expect.objectContaining(options2) }));
  });
});