import { sleepFct } from './../utils';
import { GoogleSearch } from './googleSearch';

jest.setTimeout(5000000);
//25594378AL gege518750
describe('Browser', () => {

    test('should be unique', async () => {
        try {
            // const googleSearch = new GoogleSearch();
            // const results = await googleSearch.search('Top 10 des jouets pour chien noel 2024');
            // console.log(results);
            await sleepFct(20000000);
        } catch (error) {
            console.error('Error posting tweet', error);
        }
    });
});

