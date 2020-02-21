import { asyncRenderScheduler } from './async-render-scheduler';
import { RenderSchedule } from './render-schedule';

describe('asyncRenderScheduler', () => {

  let schedule: RenderSchedule;
  let schedule2: RenderSchedule;

  beforeEach(() => {
    schedule = asyncRenderScheduler();
    schedule2 = asyncRenderScheduler();
  });

  it('render deferred', async () => {

    const render = jest.fn();

    schedule(render);
    expect(render).not.toHaveBeenCalled();

    await Promise.resolve();
    expect(render).toHaveBeenCalledTimes(1);
  });
  it('executes only the last scheduled render', async () => {

    const render1 = jest.fn();
    const render2 = jest.fn();

    schedule(render1);
    schedule(render2);
    expect(render1).not.toHaveBeenCalled();
    expect(render2).not.toHaveBeenCalled();

    await Promise.resolve();
    expect(render1).not.toHaveBeenCalled();
    expect(render2).toHaveBeenCalledTimes(1);
  });
  it('executes renders from different schedules simultaneously', async () => {

    const render1 = jest.fn();
    const render2 = jest.fn();

    schedule(render1);
    schedule2(render2);
    expect(render1).not.toHaveBeenCalled();
    expect(render2).not.toHaveBeenCalled();

    await Promise.resolve();
    expect(render1).toHaveBeenCalledTimes(1);
    expect(render2).toHaveBeenCalledTimes(1);
  });
});