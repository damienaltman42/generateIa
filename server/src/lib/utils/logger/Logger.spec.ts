import { Logger } from './Logger';

test('test logger', async () => {
    Logger.info('test info');
    Logger.error({ message: "This is an error message", code: 500 });
    Logger.warning('test warn');
    expect(true).toBe(true);
});